import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserName } from '@/hooks/useUserName';
import { User, Save } from 'lucide-react';

export function UserNameInput() {
  const { userName, setUserName, getDisplayName } = useUserName();
  const [inputValue, setInputValue] = useState(userName);
  const [isEditing, setIsEditing] = useState(false);

  // Sync inputValue with userName when it changes (e.g., from localStorage)
  useEffect(() => {
    setInputValue(userName);
  }, [userName]);

  const handleSave = () => {
    setUserName(inputValue.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(userName);
    setIsEditing(false);
  };

  const currentDisplayName = getDisplayName();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Payment Name</h3>
      
      {!isEditing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{currentDisplayName}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="w-full text-xs"
          >
            Change Name
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter your name (optional)"
            className="text-sm"
            maxLength={50}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              className="flex-1 text-xs"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex-1 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        This name will appear in Lightning payment metadata
      </p>
    </div>
  );
} 