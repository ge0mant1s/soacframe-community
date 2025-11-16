
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Type, 
  Image as ImageIcon, 
  Code, 
  Layout 
} from 'lucide-react';
import { toast } from 'sonner';

type WebContentType = 'TEXT' | 'IMAGE' | 'ICON' | 'JSON' | 'WIDGET' | 'HTML';

interface WebsiteContent {
  id: string;
  section: string;
  contentKey: string;
  contentType: WebContentType;
  value?: string | null;
  jsonValue?: any;
  order: number;
  isVisible: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

const sections = [
  'hero',
  'features',
  'attack-detection',
  'ai-intelligence',
  'threat-intelligence',
  'dashboard-showcase',
  'deployment',
  'documentation',
  'github',
  'scenarios',
  'social-proof',
  'support',
  'footer',
  'pricing',
  'navigation',
];

const contentTypes: { value: WebContentType; label: string; icon: any }[] = [
  { value: 'TEXT', label: 'Text', icon: Type },
  { value: 'IMAGE', label: 'Image', icon: ImageIcon },
  { value: 'ICON', label: 'Icon', icon: Layout },
  { value: 'JSON', label: 'JSON/Object', icon: Code },
  { value: 'WIDGET', label: 'Widget Config', icon: Layout },
  { value: 'HTML', label: 'HTML', icon: Code },
];

export default function WebsiteContentManager() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [contents, setContents] = useState<WebsiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>('hero');
  const [editingContent, setEditingContent] = useState<WebsiteContent | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    section: 'hero',
    contentKey: '',
    contentType: 'TEXT' as WebContentType,
    value: '',
    jsonValue: '',
    order: 0,
    isVisible: true,
    metadata: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchContents();
    }
  }, [status, selectedSection]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/website-content?section=${selectedSection}`);
      if (!response.ok) throw new Error('Failed to fetch content');
      const data = await response.json();
      setContents(data.contents || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: any = {
        section: formData.section,
        contentKey: formData.contentKey,
        contentType: formData.contentType,
        value: formData.value || null,
        order: formData.order,
        isVisible: formData.isVisible,
      };

      // Parse JSON fields if provided
      if (formData.jsonValue) {
        try {
          payload.jsonValue = JSON.parse(formData.jsonValue);
        } catch (e) {
          toast.error('Invalid JSON in JSON Value field');
          return;
        }
      }

      if (formData.metadata) {
        try {
          payload.metadata = JSON.parse(formData.metadata);
        } catch (e) {
          toast.error('Invalid JSON in Metadata field');
          return;
        }
      }

      if (editingContent) {
        // Update
        const response = await fetch('/api/admin/website-content', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingContent.id, ...payload }),
        });

        if (!response.ok) throw new Error('Failed to update content');
        toast.success('Content updated successfully');
      } else {
        // Create
        const response = await fetch('/api/admin/website-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to create content');
        toast.success('Content created successfully');
      }

      resetForm();
      fetchContents();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (content: WebsiteContent) => {
    setEditingContent(content);
    setIsCreating(true);
    setFormData({
      section: content.section,
      contentKey: content.contentKey,
      contentType: content.contentType,
      value: content.value || '',
      jsonValue: content.jsonValue ? JSON.stringify(content.jsonValue, null, 2) : '',
      order: content.order,
      isVisible: content.isVisible,
      metadata: content.metadata ? JSON.stringify(content.metadata, null, 2) : '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await fetch(`/api/admin/website-content?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete content');
      toast.success('Content deleted successfully');
      fetchContents();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setEditingContent(null);
    setIsCreating(false);
    setFormData({
      section: selectedSection,
      contentKey: '',
      contentType: 'TEXT',
      value: '',
      jsonValue: '',
      order: 0,
      isVisible: true,
      metadata: '',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Website Content Manager</h1>
          <p className="text-muted-foreground">
            Manage all website content: text, images, icons, and widgets
          </p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {isCreating ? 'Cancel' : 'Add Content'}
        </Button>
      </div>

      <Tabs value={selectedSection} onValueChange={setSelectedSection}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2">
          {sections.slice(0, 8).map((section) => (
            <TabsTrigger key={section} value={section} className="capitalize">
              {section}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-2 flex flex-wrap gap-2">
          {sections.slice(8).map((section) => (
            <Button
              key={section}
              variant={selectedSection === section ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSection(section)}
              className="capitalize"
            >
              {section}
            </Button>
          ))}
        </div>
      </Tabs>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingContent ? 'Edit Content' : 'Create New Content'}</CardTitle>
            <CardDescription>
              Add or update website content for the {selectedSection} section
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Select
                    value={formData.section}
                    onValueChange={(value) => setFormData({ ...formData, section: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section} value={section} className="capitalize">
                          {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentKey">Content Key *</Label>
                  <Input
                    id="contentKey"
                    value={formData.contentKey}
                    onChange={(e) => setFormData({ ...formData, contentKey: e.target.value })}
                    placeholder="e.g., hero.title or features.card1.title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type *</Label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value: WebContentType) =>
                      setFormData({ ...formData, contentType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Textarea
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="Enter text, URL, icon name, or leave empty for JSON data"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jsonValue">JSON Value (Optional)</Label>
                <Textarea
                  id="jsonValue"
                  value={formData.jsonValue}
                  onChange={(e) => setFormData({ ...formData, jsonValue: e.target.value })}
                  placeholder={'{\n  "key": "value"\n}'}
                  rows={5}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metadata">Metadata (Optional JSON)</Label>
                <Textarea
                  id="metadata"
                  value={formData.metadata}
                  onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                  placeholder={'{\n  "alt": "Image description",\n  "className": "custom-class"\n}'}
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isVisible"
                  checked={formData.isVisible}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                />
                <Label htmlFor="isVisible">Visible on website</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {editingContent ? 'Update Content' : 'Create Content'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Content in {selectedSection} Section</CardTitle>
          <CardDescription>
            {contents.length} content item{contents.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No content items found for this section. Click "Add Content" to create one.
            </div>
          ) : (
            <div className="space-y-4">
              {contents.map((content) => {
                const ContentTypeIcon = contentTypes.find((t) => t.value === content.contentType)?.icon || Type;
                
                return (
                  <Card key={content.id} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ContentTypeIcon className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-base">{content.contentKey}</CardTitle>
                            {!content.isVisible && (
                              <Badge variant="secondary">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Hidden
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            <Badge variant="outline" className="mr-2">
                              {content.contentType}
                            </Badge>
                            Order: {content.order}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(content)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(content.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {content.value && (
                        <div className="mb-2">
                          <Label className="text-xs text-muted-foreground">Value:</Label>
                          <p className="text-sm mt-1 line-clamp-2">{content.value}</p>
                        </div>
                      )}
                      {content.jsonValue && (
                        <div>
                          <Label className="text-xs text-muted-foreground">JSON Data:</Label>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto max-h-40">
                            {JSON.stringify(content.jsonValue, null, 2)}
                          </pre>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
