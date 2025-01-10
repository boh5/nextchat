'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc/client';
import { Settings, Users } from 'lucide-react';
import { useState } from 'react';

interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  lastMessageId: string | null;
}

type GroupWithRole = {
  group: Group;
  role: 'admin' | 'member';
};

function EditGroupDialog({
  group,
  onClose,
}: {
  group: Group;
  onClose: () => void;
}) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const updateGroupMutation = trpc.group.updateGroup.useMutation({
    onSuccess: () => {
      toast({
        description: 'Group updated successfully',
      });
      setIsOpen(false);
      onClose();
      utils.group.getUserGroups.invalidate();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update group',
      });
    },
  });

  const deleteGroupMutation = trpc.group.deleteGroup.useMutation({
    onSuccess: () => {
      toast({
        description: 'Group deleted successfully',
      });
      setIsOpen(false);
      onClose();
      utils.group.getUserGroups.invalidate();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete group',
      });
    },
  });

  const handleSubmit = () => {
    updateGroupMutation.mutate({
      groupId: group.id,
      data: { name, description },
    });
  };

  const handleDelete = () => {
    if (deleteConfirmName !== group.name) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Group name does not match',
      });
      return;
    }

    deleteGroupMutation.mutate({ groupId: group.id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Group Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Group Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={updateGroupMutation.isPending}
          >
            {updateGroupMutation.isPending ? 'Updating...' : 'Update Group'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Danger Zone
              </span>
            </div>
          </div>

          {showDeleteConfirm ? (
            <div className="space-y-4 rounded-md border border-destructive p-4">
              <div className="text-muted-foreground text-sm">
                To confirm deletion, please type the group name:{' '}
                <span className="font-medium">{group.name}</span>
              </div>
              <Input
                placeholder="Type group name to confirm"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={deleteGroupMutation.isPending}
                >
                  {deleteGroupMutation.isPending
                    ? 'Deleting...'
                    : 'Confirm Delete'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Group
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateGroupDialog() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const createGroupMutation = trpc.group.createGroup.useMutation({
    onSuccess: () => {
      toast({
        description: 'Group created successfully',
      });
      setIsOpen(false);
      setName('');
      setDescription('');
      utils.group.getUserGroups.invalidate();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create group',
      });
    },
  });

  const handleSubmit = () => {
    createGroupMutation.mutate({ name, description });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Users className="mr-2 h-4 w-4" />
          Create New Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Group Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Group Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={createGroupMutation.isPending}
          >
            {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GroupManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: userGroups = [], isLoading } =
    trpc.group.getUserGroups.useQuery();

  const leaveGroupMutation = trpc.group.leaveGroup.useMutation({
    onSuccess: () => {
      toast({
        description: 'Left group successfully',
      });
      utils.group.getUserGroups.invalidate();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to leave group',
      });
    },
  });

  const handleLeaveGroup = (groupId: string) => {
    leaveGroupMutation.mutate({ groupId });
  };

  const filteredGroups = (userGroups as GroupWithRole[]).filter((group) =>
    group.group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4">
      <CreateGroupDialog />
      <Input
        placeholder="Search groups..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4">
          {(() => {
            if (isLoading) {
              return <div className="text-center">Loading...</div>;
            }

            if (filteredGroups.length === 0) {
              return (
                <div className="text-center text-muted-foreground">
                  No groups found
                </div>
              );
            }

            return filteredGroups.map(({ group, role }) => (
              <div
                key={group.id}
                className="flex items-center justify-between space-x-4 rounded-lg border p-4"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={group.avatar || undefined} />
                    <AvatarFallback>
                      <Users className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{group.name}</div>
                    {group.description && (
                      <div className="text-muted-foreground text-sm">
                        {group.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {role === 'admin' && (
                    <EditGroupDialog
                      group={group}
                      onClose={() => {
                        /*TODO: later*/
                      }}
                    />
                  )}
                  {role === 'member' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLeaveGroup(group.id)}
                      disabled={leaveGroupMutation.isPending}
                    >
                      {leaveGroupMutation.isPending ? 'Leaving...' : 'Leave'}
                    </Button>
                  )}
                </div>
              </div>
            ));
          })()}
        </div>
      </ScrollArea>
    </div>
  );
}
