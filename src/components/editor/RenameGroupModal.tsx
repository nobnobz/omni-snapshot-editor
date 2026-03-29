"use client";

import React, { useId, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useConfigActions, useConfigSelector } from "@/context/ConfigContext";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { editorAction, editorLayout } from "@/components/editor/ui/style-contract";
import { EditorNotice } from "@/components/editor/ui/EditorNotice";

interface RenameGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    oldName: string;
    isMainGroup?: boolean;
    onRename: (oldName: string, newName: string) => void;
}

export function RenameGroupModal({ isOpen, onClose, oldName, isMainGroup = false, onRename }: RenameGroupModalProps) {
    const countReferences = useConfigActions().countReferences;
    const catalogGroups = useConfigSelector((state) => state.currentValues.catalog_groups);
    const [newName, setNewName] = useState(oldName);
    const nameInputId = useId();

    const refCount = countReferences(oldName, isMainGroup);

    // Check if new name exists
    const newNameExists = !isMainGroup && !!catalogGroups?.[newName.trim()] && newName.trim() !== oldName;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newName.trim();
        if (!trimmed || trimmed === oldName) {
            onClose();
            return;
        }
        onRename(oldName, trimmed);
        onClose();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setNewName(oldName);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent 
                onOpenAutoFocus={() => setNewName(oldName)}
                className={cn(editorLayout.dialogContent, "sm:max-w-[425px]")}
            >
                <DialogHeader>
                    <DialogTitle>Rename {isMainGroup ? "Main Group" : "Group"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div>
                        <label htmlFor={nameInputId} className="text-xs text-foreground/70 mb-1 block">Name</label>
                        <Input
                            id={nameInputId}
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            className="h-10 text-base sm:text-sm bg-background border-input focus-visible:ring-ring/50"
                        />
                    </div>

                    <EditorNotice tone="info" icon={<AlertCircle className="w-4 h-4" />}>
                        <div>
                            <p className="text-inherit opacity-90">This group is referenced in <strong className="font-bold opacity-100">{refCount}</strong> places.</p>
                            <p className="text-inherit opacity-75 text-xs mt-1">Renaming will automatically update all references to prevent orphans.</p>
                        </div>
                    </EditorNotice>

                    {newNameExists && (
                        <EditorNotice tone="warning" icon={<AlertCircle className="w-4 h-4" />}>
                            <div>
                                <p className="font-bold opacity-100">Merge Warning</p>
                                <p className="text-inherit opacity-80 text-xs mt-1">A group named &quot;{newName.trim()}&quot; already exists. Proceeding will merge their contents together.</p>
                            </div>
                        </EditorNotice>
                    )}

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={onClose} className={editorAction.secondary}>Cancel</Button>
                        <Button type="submit" className={newNameExists ? cn(editorAction.secondary, "h-10 sm:h-9 editor-tone-warning") : editorAction.primary}>
                            {newNameExists ? "Merge Groups" : "Rename"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
