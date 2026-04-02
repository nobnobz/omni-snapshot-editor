"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useConfigActions, useConfigSelector } from "@/context/ConfigContext";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Switch } from "@/components/ui/switch";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { editorHover, editorSurface } from "@/components/editor/ui/style-contract";

function SortableElementItem({
    id,
    isVisible,
    onToggle,
}: {
    id: string,
    isVisible: boolean,
    onToggle: (isVisible: boolean) => void,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group touch-drag-surface flex items-center gap-3 p-3 rounded-lg border mb-2 relative",
                !isDragging && editorHover.transition,
                editorSurface.cardInteractive,
                isDragging ? "opacity-50 border-primary" : "border-slate-200/60 dark:border-white/5",
                !isVisible && "opacity-70 bg-muted/20"
            )}
        >
            <button
                {...attributes}
                {...listeners}
                className={cn("touch-drag-handle cursor-grab select-none p-1 rounded hover:bg-muted/50", editorHover.softAction)}
                aria-label="Drag handle"
            >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                    <p className={cn(
                        "text-base truncate font-medium",
                        !isVisible ? "text-foreground/50 line-through" : "text-foreground"
                    )}>
                        {id}
                    </p>
                    <span className="text-xs text-muted-foreground">
                        {isVisible ? `Show ${id.toLowerCase()}` : `Hide ${id.toLowerCase()}`}
                    </span>
                </div>
            </div>
            <Switch
                checked={isVisible}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-primary"
            />
        </div>
    );
}

export function StreamElementOrderingEditor() {
    const streamButtonElementsOrder = useConfigSelector((state) => state.currentValues.stream_button_elements_order);
    const hiddenStreamButtonElements = useConfigSelector((state) => state.currentValues.hidden_stream_button_elements);
    const { toggleStreamElement, reorderStreamElements } = useConfigActions();

    // Explicit list to ensure we don't end up with an empty list if config is missing
    const defaultOrder = ["Title", "Metadata Tags", "Pattern Tags", "Addon Name"];
    const elementOrder = (streamButtonElementsOrder as string[]) || defaultOrder;
    const hiddenElements = new Set((hiddenStreamButtonElements as string[]) || []);

    const [items, setItems] = useState(elementOrder);
    const [activeId, setActiveId] = useState<string | null>(null);

    React.useEffect(() => {
        setItems(elementOrder);
    }, [elementOrder]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 300,
                tolerance: 8,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(String(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (over && active.id !== over.id) {
            const activeId = String(active.id);
            const overId = String(over.id);
            const oldIndex = items.indexOf(activeId);
            const newIndex = items.indexOf(overId);
            const newArray = arrayMove(items, oldIndex, newIndex);

            setItems(newArray);
            reorderStreamElements(newArray);
        }
    };

    if (items.length === 0) return null;

    return (
        <div
            className={cn(
                "p-4 sm:p-5 transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out",
                editorSurface.card,
                "border-slate-200/78 shadow-[0_8px_20px_rgba(15,23,42,0.045)] dark:border-white/8 dark:shadow-[0_6px_14px_rgba(2,6,23,0.08)]"
            )}
        >
            <div className="flex items-start justify-between gap-3 sm:items-center mb-4 pb-4 border-b border-border/40">
                <div className="min-w-0 flex-1 flex flex-col gap-1">
                    <span className="text-base font-semibold tracking-tight text-foreground">
                        Hide Elements From The Stream Selection
                    </span>
                    <span className="text-xs sm:text-sm leading-relaxed text-foreground/60 sm:text-foreground/65">
                        Choose which elements are visible on the stream selection screen and reorder them.
                    </span>
                </div>
            </div>

            <div className="space-y-4 py-2">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={items} strategy={verticalListSortingStrategy}>
                        <div className="space-y-0.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                            {items.map((id) => (
                                <SortableElementItem
                                    key={id}
                                    id={id}
                                    isVisible={!hiddenElements.has(id)}
                                    onToggle={(visible) => toggleStreamElement(id, visible)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                    {activeId && typeof document !== 'undefined' ? createPortal(
                        <DragOverlay dropAnimation={{
                            sideEffects: defaultDropAnimationSideEffects({
                                styles: {
                                    active: {
                                        opacity: '0.4',
                                    },
                                },
                            }),
                        }}>
                            {activeId ? (
                                <div className="flex items-center gap-3 p-3 bg-muted border border-primary rounded-lg shadow-2xl scale-[1.02] opacity-90 backdrop-blur-sm">
                                    <GripVertical className="h-4 w-4 text-primary" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base truncate font-medium text-foreground">
                                            {activeId}
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </DragOverlay>,
                        document.body
                    ) : null}
                </DndContext>
            </div>
        </div>
    );
}
