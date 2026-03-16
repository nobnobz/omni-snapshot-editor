"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useConfig } from "@/context/ConfigContext";
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

function SortableShelfItem({
    id,
    isEnabled,
    onToggle,
}: {
    id: string,
    isEnabled: boolean,
    onToggle: (isEnabled: boolean) => void,
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
                "group flex items-center gap-3 p-3 rounded-lg mb-2 relative",
                !isDragging && editorHover.transition,
                editorSurface.cardInteractive,
                isDragging ? "opacity-50 border-primary" : "",
                !isEnabled && "opacity-70"
            )}
        >
            <button
                {...attributes}
                {...listeners}
                className={cn("cursor-grab select-none", editorHover.softAction)}
                style={{ touchAction: 'none' }}
                aria-label="Drag handle"
            >
                <GripVertical className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
                <p className={cn(
                    "text-base truncate font-medium",
                    !isEnabled ? "text-foreground/60 line-through" : "text-foreground"
                )}>
                    {id}
                </p>
            </div>
            <Switch
                checked={isEnabled}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-primary"
            />
        </div>
    );
}

export function ShelfOrderingEditor() {
    const { currentValues, toggleShelf, reorderShelves } = useConfig();
    
    const shelfOrder = (currentValues.shelf_order as string[]) || [];
    const disabledShelves = new Set((currentValues.disabled_shelves as string[]) || []);

    const [items, setItems] = useState(shelfOrder);
    const [activeId, setActiveId] = useState<string | null>(null);

    React.useEffect(() => {
        setItems(shelfOrder);
    }, [shelfOrder]);

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
            reorderShelves(newArray);
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
                        Shelf Ordering
                    </span>
                    <span className="text-xs sm:text-sm leading-relaxed text-foreground/60 sm:text-foreground/65">
                        Enable, disable, and reorder the shelves displayed on the home screen.
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
                                <SortableShelfItem
                                    key={id}
                                    id={id}
                                    isEnabled={!disabledShelves.has(id)}
                                    onToggle={(active) => toggleShelf(id, active)}
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
