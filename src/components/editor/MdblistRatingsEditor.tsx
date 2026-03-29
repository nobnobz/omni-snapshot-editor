"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useConfigActions, useConfigSelector } from "@/context/ConfigContext";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    closestCenter,
    defaultDropAnimationSideEffects,
    type DragEndEvent,
    type DragStartEvent,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
    sortableKeyboardCoordinates,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, GripVertical, Info, Plus, RotateCcw, SmilePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { shallowEqualObject } from "@/lib/equality";
import {
    MDBLIST_DEFAULT_BADGE_COLOR_VALUES,
    MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES,
    MDBLIST_DEFAULT_ENABLED_RATINGS,
    MDBLIST_RATING_DEFINITIONS,
    type MdblistRatingDefinition,
    type MdblistRatingKey,
    isSupportedMdblistRatingKey,
    normalizeMdblistBadgeColorValues,
    normalizeMdblistBadgeTextOverrides,
    normalizeMdblistEnabledRatings,
    normalizeMdblistRatingOrder,
} from "@/lib/mdblist-ratings";
import { editorHover, editorSurface } from "@/components/editor/ui/style-contract";
import { EditorNotice } from "@/components/editor/ui/EditorNotice";

const isHexColor = (value: string) => /^#[0-9A-Fa-f]{6}$/.test(value);
const isHexColorWithAlpha = (value: string) => /^#[0-9A-Fa-f]{8}$/.test(value);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const graphemeSegmenter = typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

const splitGraphemes = (value: string): string[] => {
    if (graphemeSegmenter) {
        return Array.from(graphemeSegmenter.segment(value), (entry) => entry.segment);
    }

    return Array.from(value);
};

const isAlphaNumericGrapheme = (value: string) => /[\p{L}\p{N}]/u.test(value);

const EMOJI_OPTIONS = [
    { emoji: "⭐️", label: "Star" },
    { emoji: "🔥", label: "Fire" },
    { emoji: "🎬", label: "Movie" },
    { emoji: "🍅", label: "Tomato" },
    { emoji: "🍿", label: "Popcorn" },
    { emoji: "🏆", label: "Trophy" },
    { emoji: "💯", label: "Perfect score" },
    { emoji: "💙", label: "Blue heart" },
    { emoji: "🟢", label: "Green circle" },
    { emoji: "🟨", label: "Yellow square" },
    { emoji: "✨", label: "Sparkles" },
    { emoji: "🎯", label: "Bullseye" },
    { emoji: "🎖️", label: "Medal" },
    { emoji: "🥇", label: "Gold medal" },
    { emoji: "📈", label: "Rising chart" },
    { emoji: "📊", label: "Chart" },
    { emoji: "✅", label: "Check mark" },
    { emoji: "👏", label: "Applause" },
    { emoji: "👍", label: "Thumbs up" },
    { emoji: "👑", label: "Crown" },
    { emoji: "💎", label: "Diamond" },
    { emoji: "⚡️", label: "Lightning" },
    { emoji: "🌟", label: "Glowing star" },
    { emoji: "🎞️", label: "Film" },
    { emoji: "📽️", label: "Projector" },
    { emoji: "🎥", label: "Camera" },
    { emoji: "🎭", label: "Masks" },
    { emoji: "🧠", label: "Brain" },
    { emoji: "🫶", label: "Heart hands" },
    { emoji: "❤️", label: "Red heart" },
    { emoji: "🖤", label: "Black heart" },
    { emoji: "💥", label: "Impact" },
    { emoji: "🚀", label: "Rocket" },
    { emoji: "🌈", label: "Rainbow" },
    { emoji: "☄️", label: "Comet" },
    { emoji: "🎟️", label: "Ticket" },
    { emoji: "🪩", label: "Disco ball" },
    { emoji: "🥂", label: "Cheers" },
    { emoji: "🔮", label: "Crystal ball" },
    { emoji: "🌀", label: "Spiral" },
] as const;

const EMOJI_QUICK_OPTIONS = ["⭐️", "🔥", "🎬", "🍅", "🍿", "🏆", "💯", "💙", "✨", "🎯"];

const getDefinition = (key: MdblistRatingKey): MdblistRatingDefinition =>
    MDBLIST_RATING_DEFINITIONS.find((definition) => definition.key === key) ?? MDBLIST_RATING_DEFINITIONS[0];

const formatColorWithTransparency = (hex: string, transparency: number) => {
    const normalizedHex = isHexColor(hex) ? hex.toUpperCase() : "#000000";
    const normalizedTransparency = clamp(transparency, 0, 100);
    const opacityPercent = 100 - normalizedTransparency;
    const alpha = Math.round((opacityPercent / 100) * 255)
        .toString(16)
        .padStart(2, "0")
        .toUpperCase();
    return `${normalizedHex}${alpha}`;
};

const parseBadgeColor = (value: string, fallback: string) => {
    let normalized = isHexColorWithAlpha(fallback)
        ? fallback.toUpperCase()
        : isHexColor(fallback)
            ? `${fallback.toUpperCase()}FF`
            : "#00000000";

    if (isHexColorWithAlpha(value)) {
        normalized = value.toUpperCase();
    } else if (isHexColor(value)) {
        normalized = `${value.toUpperCase()}FF`;
    }

    const hex = normalized.slice(0, 7);
    const alpha = parseInt(normalized.slice(7, 9), 16);
    const opacityPercent = Math.round((alpha / 255) * 100);

    return {
        full: normalized,
        hex,
        transparency: 100 - opacityPercent,
    };
};

const sanitizeBadgeTextInput = (value: string) => {
    const graphemes = splitGraphemes(value.trim());
    let symbol = "";
    const alphaNumeric: string[] = [];

    graphemes.forEach((grapheme) => {
        if (isAlphaNumericGrapheme(grapheme)) {
            if (alphaNumeric.length < 2) {
                alphaNumeric.push(grapheme.toLocaleUpperCase());
            }
            return;
        }

        if (!symbol && grapheme.trim() !== "") {
            symbol = grapheme;
        }
    });

    return `${symbol}${alphaNumeric.join("")}`;
};

const applyEmojiToBadgeText = (emoji: string, currentValue: string) =>
    sanitizeBadgeTextInput(`${emoji}${currentValue}`);

function SortableMdblistRow({
    definition,
    badgeText,
    badgeColor,
    isExpanded,
    onToggleExpanded,
    onBadgeTextChange,
    onColorChange,
    onTransparencyChange,
    onRemove,
}: {
    definition: MdblistRatingDefinition;
    badgeText: string;
    badgeColor: string;
    isExpanded: boolean;
    onToggleExpanded: () => void;
    onBadgeTextChange: (value: string) => void;
    onColorChange: (value: string) => void;
    onTransparencyChange: (value: number) => void;
    onRemove: () => void;
}) {
    const [isEmojiDialogOpen, setIsEmojiDialogOpen] = useState(false);
    const [emojiInput, setEmojiInput] = useState("");

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: definition.key,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    const parsedColor = parseBadgeColor(badgeColor, MDBLIST_DEFAULT_BADGE_COLOR_VALUES[definition.key]);
    const emojiShortcutHint = "Tip: you can also use your system emoji picker here, for example Ctrl+Cmd+Space on macOS or Win+. on Windows.";
    const contentId = `mdblist-settings-${definition.key}`;
    const applyEmojiSelection = (emoji: string) => {
        onBadgeTextChange(applyEmojiToBadgeText(emoji, badgeText));
        setIsEmojiDialogOpen(false);
        setEmojiInput("");
    };

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className={cn(
                    "rounded-xl border p-3 h-full",
                    editorSurface.cardInteractive,
                    isDragging ? "border-primary opacity-55" : ""
                )}
            >
                <div className="flex flex-col gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            {...attributes}
                            {...listeners}
                            className={cn(
                                "rounded-md p-1 text-muted-foreground",
                                editorHover.softAction
                            )}
                            style={{ touchAction: "none" }}
                            aria-label={`Reorder ${definition.label}`}
                        >
                            <GripVertical className="h-4 w-4" />
                        </button>

                        <button
                            type="button"
                            onClick={onToggleExpanded}
                            aria-expanded={isExpanded}
                            aria-controls={contentId}
                            className={cn(
                                "flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-left transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out",
                                editorHover.softAction
                            )}
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <div
                                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-base shadow-sm"
                                    style={{
                                        backgroundColor: parsedColor.full,
                                        borderColor: `${parsedColor.hex}44`,
                                        color: parsedColor.hex,
                                    }}
                                    aria-hidden="true"
                                >
                                    {badgeText || "\u00A0"}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-[15px] font-semibold tracking-tight text-foreground sm:text-base">
                                        {definition.label}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight
                                className={cn(
                                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                                    isExpanded ? "rotate-90" : ""
                                )}
                            />
                        </button>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={onRemove}
                            className="rounded-full text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                            aria-label={`Remove ${definition.label}`}
                            title={`Remove ${definition.label}`}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {isExpanded ? (
                        <div id={contentId} className="grid gap-3 md:grid-cols-2">
                            <div className="flex h-full flex-col rounded-xl border border-border/70 bg-background/30 p-3">
                                <div className="mb-2 flex h-6 items-center justify-between gap-3">
                                    <Label htmlFor={`mdblist-badge-text-${definition.key}`} className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                        Text
                                    </Label>
                                    <span className="text-xs text-transparent select-none">
                                        Placeholder
                                    </span>
                                </div>
                                <div className="flex min-h-10 items-center gap-2">
                                    <Input
                                        id={`mdblist-badge-text-${definition.key}`}
                                        value={badgeText}
                                        onChange={(event) => onBadgeTextChange(event.target.value)}
                                        placeholder={MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES[definition.key]}
                                        className="h-10 bg-background/55 text-sm"
                                    />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon-sm"
                                                className="h-10 w-10 shrink-0 border-border/70"
                                                aria-label={`Select emoji for ${definition.label}`}
                                                title="Insert emoji"
                                            >
                                                <SmilePlus className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 p-2">
                                            <div className="grid grid-cols-5 gap-1">
                                                {EMOJI_QUICK_OPTIONS.map((emoji) => (
                                                    <DropdownMenuItem
                                                        key={`${definition.key}-${emoji}`}
                                                        className="flex h-9 w-9 items-center justify-center rounded-md p-0 text-lg"
                                                        onSelect={() => onBadgeTextChange(applyEmojiToBadgeText(emoji, badgeText))}
                                                    >
                                                        {emoji}
                                                    </DropdownMenuItem>
                                                ))}
                                            </div>
                                            <div className="mt-2 border-t border-border/60 pt-2">
                                                <DropdownMenuItem
                                                    className="justify-center rounded-md text-sm"
                                                    onSelect={() => {
                                                        setIsEmojiDialogOpen(true);
                                                        setEmojiInput("");
                                                    }}
                                                >
                                                    More...
                                                </DropdownMenuItem>
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <div className="flex h-full flex-col rounded-xl border border-border/70 bg-background/30 p-3">
                                <div className="mb-2 flex h-6 items-center justify-between gap-3">
                                    <Label htmlFor={`mdblist-color-${definition.key}`} className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                        Background
                                    </Label>
                                    <span className="text-xs text-muted-foreground">
                                        {parsedColor.transparency === 100
                                            ? "No background"
                                            : `${parsedColor.transparency}% transparent`}
                                    </span>
                                </div>

                                <div className="flex min-h-10 flex-1 items-center gap-3 rounded-xl border border-border/70 bg-background/35 px-3 py-2">
                                    <Input
                                        id={`mdblist-color-${definition.key}`}
                                        type="color"
                                        value={parsedColor.hex}
                                        onChange={(event) => onColorChange(event.target.value)}
                                        className="h-10 w-10 cursor-pointer rounded-lg border border-border/70 bg-background/55 p-1"
                                    />
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={parsedColor.transparency}
                                        onChange={(event) => onTransparencyChange(Number(event.target.value))}
                                        className="h-2 w-full accent-primary"
                                        aria-label={`${definition.label} background transparency`}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
            <Dialog
                open={isEmojiDialogOpen}
                onOpenChange={(open) => {
                    setIsEmojiDialogOpen(open);
                    if (!open) {
                        setEmojiInput("");
                    }
                }}
            >
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Select Emoji</DialogTitle>
                        <DialogDescription>
                            Pick an emoji for {definition.label} or paste your own.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <EditorNotice tone="info" alignCenter>
                            <p className="leading-relaxed">
                                {emojiShortcutHint}
                            </p>
                        </EditorNotice>
                        <div className="rounded-xl border border-border/70 bg-background/30 p-3">
                            <Label htmlFor={`emoji-input-${definition.key}`} className="mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                Emoji Input
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id={`emoji-input-${definition.key}`}
                                    value={emojiInput}
                                    onChange={(event) => setEmojiInput(event.target.value)}
                                    placeholder="Type or paste an emoji"
                                    className="h-10 bg-background/55 text-sm"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 shrink-0 border-border/70"
                                    disabled={sanitizeBadgeTextInput(emojiInput) === ""}
                                    onClick={() => applyEmojiSelection(emojiInput)}
                                >
                                    Use
                                </Button>
                            </div>
                        </div>
                        <div className="grid max-h-[320px] grid-cols-6 gap-2 overflow-y-auto pr-1 custom-scrollbar sm:grid-cols-7">
                            {EMOJI_OPTIONS.map((option) => (
                                <Button
                                    key={`${definition.key}-${option.emoji}-${option.label}`}
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-11 w-11 rounded-xl border-border/70 text-xl"
                                    onClick={() => applyEmojiSelection(option.emoji)}
                                    title={option.label}
                                    aria-label={option.label}
                                >
                                    {option.emoji}
                                </Button>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function MdblistRatingsEditor() {
    const {
        mdblistEnabledRatings,
        mdblistRatingOrder,
        mdblistBadgeTextOverrides,
        mdblistBadgeColorHexValues,
    } = useConfigSelector((state) => ({
        mdblistEnabledRatings: state.currentValues.mdblist_enabled_ratings,
        mdblistRatingOrder: state.currentValues.mdblist_rating_order,
        mdblistBadgeTextOverrides: state.currentValues.mdblist_badge_text_overrides,
        mdblistBadgeColorHexValues: state.currentValues.mdblist_badge_color_hex_values,
    }), shallowEqualObject);
    const { updateValue } = useConfigActions();

    const normalizedEnabled = normalizeMdblistEnabledRatings(mdblistEnabledRatings);
    const normalizedOrder = normalizeMdblistRatingOrder(mdblistRatingOrder);
    const badgeTextOverrides = normalizeMdblistBadgeTextOverrides(mdblistBadgeTextOverrides);
    const badgeColorValues = normalizeMdblistBadgeColorValues(mdblistBadgeColorHexValues);

    const orderedSupportedRatings = normalizedOrder.filter(isSupportedMdblistRatingKey);
    const enabledSupportedRatings = orderedSupportedRatings.filter((key) => normalizedEnabled.includes(key));
    const hiddenSupportedRatings = orderedSupportedRatings.filter((key) => !normalizedEnabled.includes(key));
    const unknownOrderEntries = normalizedOrder.filter((entry) => !isSupportedMdblistRatingKey(entry));
    const unknownEnabledEntries = normalizedEnabled.filter((entry) => !isSupportedMdblistRatingKey(entry));
    const unknownBadgeTextEntries = Object.fromEntries(
        Object.entries(badgeTextOverrides).filter(([key]) => !isSupportedMdblistRatingKey(key))
    );
    const unknownBadgeColorEntries = Object.fromEntries(
        Object.entries(badgeColorValues).filter(([key]) => !isSupportedMdblistRatingKey(key))
    );

    const [activeId, setActiveId] = useState<MdblistRatingKey | null>(null);
    const [expandedRatings, setExpandedRatings] = useState<MdblistRatingKey[]>([]);

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

    const updateEnabledRatings = (nextEnabledRatings: MdblistRatingKey[]) => {
        updateValue(["mdblist_enabled_ratings"], [...nextEnabledRatings, ...unknownEnabledEntries]);
    };

    const updateBadgeTextOverride = (key: MdblistRatingKey, value: string) => {
        const sanitizedValue = sanitizeBadgeTextInput(value);
        const nextValue = sanitizedValue || MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES[key];

        updateValue(["mdblist_badge_text_overrides"], {
            ...unknownBadgeTextEntries,
            ...Object.fromEntries(MDBLIST_RATING_DEFINITIONS.map((definition) => [
                definition.key,
                definition.key === key ? nextValue : badgeTextOverrides[definition.key],
            ])),
        });
    };

    const updateBadgeColorValue = (key: MdblistRatingKey, value: string) => {
        updateValue(["mdblist_badge_color_hex_values"], {
            ...unknownBadgeColorEntries,
            ...Object.fromEntries(MDBLIST_RATING_DEFINITIONS.map((definition) => [
                definition.key,
                definition.key === key ? value : badgeColorValues[definition.key],
            ])),
        });
    };

    const handleColorChange = (key: MdblistRatingKey, hex: string) => {
        const current = parseBadgeColor(badgeColorValues[key], MDBLIST_DEFAULT_BADGE_COLOR_VALUES[key]);
        updateBadgeColorValue(key, formatColorWithTransparency(hex, current.transparency));
    };

    const handleTransparencyChange = (key: MdblistRatingKey, transparency: number) => {
        const current = parseBadgeColor(badgeColorValues[key], MDBLIST_DEFAULT_BADGE_COLOR_VALUES[key]);
        updateBadgeColorValue(key, formatColorWithTransparency(current.hex, transparency));
    };

    const handleRemove = (key: MdblistRatingKey) => {
        setExpandedRatings((current) => current.filter((entry) => entry !== key));
        updateEnabledRatings(enabledSupportedRatings.filter((ratingKey) => ratingKey !== key));
    };

    const handleAdd = (key: MdblistRatingKey) => {
        updateEnabledRatings(orderedSupportedRatings.filter(
            (ratingKey) => enabledSupportedRatings.includes(ratingKey) || ratingKey === key
        ));
    };

    const handleToggleExpanded = (key: MdblistRatingKey) => {
        setExpandedRatings((current) => (
            current.includes(key)
                ? current.filter((entry) => entry !== key)
                : [...current, key]
        ));
    };

    const handleDragStart = (event: DragStartEvent) => {
        const nextActive = String(event.active.id);
        if (isSupportedMdblistRatingKey(nextActive)) {
            setActiveId(nextActive);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);

        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeKey = String(active.id);
        const overKey = String(over.id);
        if (!isSupportedMdblistRatingKey(activeKey) || !isSupportedMdblistRatingKey(overKey)) return;

        const oldIndex = enabledSupportedRatings.indexOf(activeKey);
        const newIndex = enabledSupportedRatings.indexOf(overKey);
        const nextVisibleItems = arrayMove(enabledSupportedRatings, oldIndex, newIndex);

        let visibleIndex = 0;
        const nextSupportedOrder = orderedSupportedRatings.map((ratingKey) => {
            if (!enabledSupportedRatings.includes(ratingKey)) {
                return ratingKey;
            }

            const nextKey = nextVisibleItems[visibleIndex];
            visibleIndex += 1;
            return nextKey;
        });

        updateValue(["mdblist_rating_order"], [...nextSupportedOrder, ...unknownOrderEntries]);
    };

    const resetToDefaults = () => {
        setExpandedRatings([]);
        updateValue(["mdblist_enabled_ratings"], [...MDBLIST_DEFAULT_ENABLED_RATINGS, ...unknownEnabledEntries]);
        updateValue(["mdblist_rating_order"], [
            ...MDBLIST_RATING_DEFINITIONS.map((definition) => definition.key),
            ...unknownOrderEntries,
        ]);
        updateValue(["mdblist_badge_text_overrides"], {
            ...unknownBadgeTextEntries,
            ...MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES,
        });
        updateValue(["mdblist_badge_color_hex_values"], {
            ...unknownBadgeColorEntries,
            ...MDBLIST_DEFAULT_BADGE_COLOR_VALUES,
        });
    };

    const inactiveDefinitions = hiddenSupportedRatings.map(getDefinition);

    return (
        <div
            className={cn(
                "p-4 sm:p-5 transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out",
                editorSurface.card,
                "border-slate-200/78 shadow-[0_8px_20px_rgba(15,23,42,0.045)] dark:border-white/8 dark:shadow-[0_6px_14px_rgba(2,6,23,0.08)]"
            )}
        >
            <div className="mb-4 flex flex-col gap-3 border-b border-border/40 pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <h4 className="text-base font-semibold tracking-tight text-foreground">MDBList Ratings</h4>
                        <p className="mt-1 text-sm leading-relaxed text-foreground/65">
                            Configure the rating badges shown in Omni.
                        </p>
                    </div>

                    <div className={cn(editorSurface.panel, "inline-flex items-center gap-1 rounded-xl p-1.5")}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 gap-2 rounded-lg px-3.5 text-foreground/82 hover:bg-muted/70 hover:text-foreground"
                                    disabled={inactiveDefinitions.length === 0}
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add source
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                {inactiveDefinitions.map((definition) => (
                                    <DropdownMenuItem key={definition.key} onSelect={() => handleAdd(definition.key)}>
                                        {definition.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetToDefaults}
                            className="h-9 gap-2 rounded-lg px-3.5 text-foreground/72 hover:bg-muted/70 hover:text-foreground"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset
                        </Button>
                    </div>
                </div>

                <EditorNotice tone="info" alignCenter>
                    <p className="leading-relaxed">
                        This feature requires an MDBList API key in your Omni settings. To disable MDBList ratings in Omni, simply remove the MDBList API key from the settings.
                    </p>
                </EditorNotice>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={enabledSupportedRatings} strategy={rectSortingStrategy}>
                    <div className="grid gap-3 xl:grid-cols-2">
                        {enabledSupportedRatings.length === 0 ? (
                            <div className="xl:col-span-2 rounded-xl border border-dashed border-border/70 bg-background/25 px-4 py-6 text-center text-sm text-muted-foreground">
                                No active rating sources. Use <span className="font-medium text-foreground">Add source</span> to bring one back.
                            </div>
                        ) : (
                            enabledSupportedRatings.map((key) => (
                                <SortableMdblistRow
                                    key={key}
                                    definition={getDefinition(key)}
                                    badgeText={badgeTextOverrides[key]}
                                    badgeColor={badgeColorValues[key]}
                                    isExpanded={expandedRatings.includes(key)}
                                    onToggleExpanded={() => handleToggleExpanded(key)}
                                    onBadgeTextChange={(value) => updateBadgeTextOverride(key, value)}
                                    onColorChange={(value) => handleColorChange(key, value)}
                                    onTransparencyChange={(value) => handleTransparencyChange(key, value)}
                                    onRemove={() => handleRemove(key)}
                                />
                            ))
                        )}
                    </div>
                </SortableContext>

                {activeId && typeof document !== "undefined" ? createPortal(
                    <DragOverlay
                        dropAnimation={{
                            sideEffects: defaultDropAnimationSideEffects({
                                styles: {
                                    active: {
                                        opacity: "0.4",
                                    },
                                },
                            }),
                        }}
                    >
                        <div className="flex w-[320px] max-w-[90vw] items-center gap-3 rounded-xl border border-primary bg-muted px-4 py-3 shadow-2xl backdrop-blur-sm">
                            <GripVertical className="h-4 w-4 text-primary" />
                            <p className="text-sm font-semibold text-foreground">
                                {getDefinition(activeId).label}
                            </p>
                        </div>
                    </DragOverlay>,
                    document.body
                ) : null}
            </DndContext>
        </div>
    );
}
