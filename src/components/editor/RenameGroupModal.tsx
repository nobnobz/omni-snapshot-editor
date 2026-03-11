"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/context/ConfigContext";
import { AlertCircle } from "lucide-react";

interface RenameGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    oldName: string;
    isMainGroup?: boolean;
    onRename: (oldName: string, newName: string) => void;
}

export function RenameGroupModal({ isOpen, onClose, oldName, isMainGroup = false, onRename }: RenameGroupModalProps) {
    const { countReferences, currentValues } = useConfig();
    const [newName, setNewName] = useState(oldName);

    // reset on open
    useEffect(() => {
        if (isOpen) setNewName(oldName);
    }, [isOpen, oldName]);

    const refCount = countReferences(oldName, isMainGroup);

    // Check if new name exists
    const newNameExists = !isMainGroup && currentValues.catalog_groups && !!currentValues.catalog_groups[newName.trim()] && newName.trim() !== oldName;

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

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-background border-border text-foreground">
                <DialogHeader>
                    <DialogTitle>Rename {isMainGroup ? "Main Group" : "Group"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div>
                        <label className="text-xs text-foreground/70 mb-1 block">Name</label>
                        <Input
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            className="h-10 text-base sm:text-sm bg-background border-input focus-visible:ring-blue-500"
                            autoFocus
                        />
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg border border-border text-sm flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-foreground/70">This group is referenced in <strong className="text-foreground">{refCount}</strong> places.</p>
                            <p className="text-foreground/70 text-xs mt-1">Renaming will automatically update all references to prevent orphans.</p>
                        </div>
                    </div>

                    {newNameExists && (
                        <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 text-sm flex items-start gap-3">
                            <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-yellow-500 font-medium">Merge Warning</p>
                                <p className="text-yellow-500/80 text-xs mt-1">A group named "{newName.trim()}" already exists. Proceeding will merge their contents together.</p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-muted text-foreground border border-transparent">Cancel</Button>
                        <Button type="submit" className={newNameExists ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}>
                            {newNameExists ? "Merge Groups" : "Rename"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
