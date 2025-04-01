
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Pencil, Save, MoveVertical } from 'lucide-react';

interface EditableHeadingProps {
  id: string;
  title: string;
  onTitleChange: (id: string, newTitle: string) => void;
  icon?: React.ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const EditableHeading = ({ 
  id, 
  title, 
  onTitleChange, 
  icon,
  onMoveUp,
  onMoveDown
}: EditableHeadingProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleSave = () => {
    onTitleChange(id, editedTitle);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-2 bg-background rounded-md border mb-2 group">
      <div className="flex items-center gap-2 flex-1">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input 
              value={editedTitle} 
              onChange={(e) => setEditedTitle(e.target.value)}
              className="h-8"
            />
            <Button size="sm" variant="ghost" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Label className="font-medium cursor-pointer">{title}</Label>
        )}
      </div>
      
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        {(onMoveUp || onMoveDown) && (
          <div className="flex flex-col mr-2">
            {onMoveUp && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0" 
                onClick={onMoveUp}
              >
                <MoveVertical className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0" 
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
