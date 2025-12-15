"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const API_BASE_URL = "https://custompackboxes.vercel.app/api/meta";

export default function MetadataPage() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();
  const [metadataList, setMetadataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setMetadataList(data);
      } else {
        setMetadataList([]);
        toast.error("API response is not in the expected format.");
      }
    } catch (error) {
      toast.error("Failed to fetch metadata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      let res;
      if (editingId) {
        res = await fetch(`${API_BASE_URL}/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      } else {
        res = await fetch(API_BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      toast.success(`Metadata ${editingId ? "updated" : "added"} successfully!`);
      reset();
      setEditingId(null);
      fetchMetadata();
    } catch (error) {
      toast.error("Failed to save metadata: " + error.message);
    }
  };

  const handleEdit = (metadata) => {
    setEditingId(metadata.identifier);
    setValue("identifier", metadata.identifier);
    setValue("pageType", metadata.pageType);
    setValue("metaTitle", metadata.metaTitle);
    setValue("metaDescription", metadata.metaDescription);
    setValue("keywords", metadata.keywords);
    setValue("canonicalUrl", metadata.canonicalUrl);
    setValue("ogImage", metadata.ogImage);
    setValue("scheme", metadata.scheme || "");
  };

  const handleDelete = async (identifier) => {
    if (!confirm("Are you sure you want to delete this metadata?")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/${identifier}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      toast.success("Metadata deleted successfully!");
      fetchMetadata();
    } catch (error) {
      toast.error("Failed to delete metadata: " + error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Metadata</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{editingId ? "Edit Metadata" : "Add New Metadata"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="identifier">Identifier</Label>
              <Input
                id="identifier"
                {...register("identifier", { required: "Identifier is required" })}
                className={errors.identifier ? "border-red-500" : ""}
              />
              {errors.identifier && (
                <p className="text-red-500 text-sm">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="pageType">Page Type</Label>
              <Select
                onValueChange={(value) => setValue("pageType", value, { shouldValidate: true })}
                defaultValue={editingId ? metadataList.find(m => m._id === editingId)?.pageType : ""}
              >
                <SelectTrigger className={errors.pageType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a page type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="static">Static</SelectItem>
                </SelectContent>
              </Select>
              {errors.pageType && (
                <p className="text-red-500 text-sm">{errors.pageType.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                {...register("metaTitle", { required: "Meta Title is required" })}
                className={errors.metaTitle ? "border-red-500" : ""}
              />
              {errors.metaTitle && (
                <p className="text-red-500 text-sm">{errors.metaTitle.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                {...register("metaDescription", { required: "Meta Description is required" })}
                className={errors.metaDescription ? "border-red-500" : ""}
              />
              {errors.metaDescription && (
                <p className="text-red-500 text-sm">{errors.metaDescription.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="keywords">Keywords</Label>
              <Input id="keywords" {...register("keywords")} />
            </div>

            <div>
              <Label htmlFor="canonicalUrl">Canonical URL</Label>
              <Input id="canonicalUrl" {...register("canonicalUrl")} />
            </div>

            <div>
              <Label htmlFor="ogImage">OG Image URL</Label>
              <Input id="ogImage" {...register("ogImage")} />
            </div>

            {/* Add Scheme Field Here */}
            <div>
              <Label htmlFor="scheme">Scheme</Label>
              <Input 
                id="scheme" 
                {...register("scheme")}
                placeholder="e.g., https, http, product"
              />
              <p className="text-xs text-gray-500 mt-1">
                Schema markup type (optional)
              </p>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Update Metadata" : "Add Metadata"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={() => { reset(); setEditingId(null); }}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : metadataList.length === 0 ? (
            <p className="text-center text-muted-foreground">No metadata found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identifier</TableHead>
                    <TableHead>Page Type</TableHead>
                    <TableHead>Meta Title</TableHead>
                    <TableHead>Scheme</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metadataList.map((metadata) => (
                    <TableRow key={metadata._id}>
                      <TableCell>{metadata.identifier}</TableCell>
                      <TableCell>{metadata.pageType}</TableCell>
                      <TableCell className="max-w-xs truncate">{metadata.metaTitle}</TableCell>
                      <TableCell>{metadata.scheme || "-"}</TableCell>
                      <TableCell className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(metadata)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(metadata.identifier)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}