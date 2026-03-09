"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RichTextEditor } from ".";
import ImageUpload from "./ImageUpload";
import { handleDelete, handleUpload } from ".";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EntityForm({
  entityType = "category",
  rePush = "categories",
  initialData = {},
}) {
  const router = useRouter();

  const [image, setImage] = useState(
    entityType === "category"
      ? initialData?.homeImage || null
      : initialData?.image || null
  );
  const [heroImage, setHeroImage] = useState(initialData?.heroImage || null);

  // Initialize additional images with proper structure
  const [additionalImages, setAdditionalImages] = useState([
    { url: "", alt: "", title: "", caption: "", description: "", public_id: "" },
    { url: "", alt: "", title: "", caption: "", description: "", public_id: "" },
    { url: "", alt: "", title: "", caption: "", description: "", public_id: "" }
  ]);

  const [longDescription, setLongDescription] = useState(
    initialData?.longDescription || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categorySlug, setCategorySlug] = useState(
    initialData?.categorySlug || ""
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      heading: initialData?.heading || "",
      h1: initialData?.h1 || "",
      shortDescription: initialData?.shortDescription || "",
      tagline: initialData?.tagline || "",
      categorySlug: initialData?.categorySlug || "",
    },
  });

  // Sync form values and other states when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset({
        name: initialData?.name || "",
        slug: initialData?.slug || "",
        heading: initialData?.heading || "",
        h1: initialData?.h1 || "",
        shortDescription: initialData?.shortDescription || "",
        tagline: initialData?.tagline || "",
        categorySlug: initialData?.categorySlug || "",
      });

      setLongDescription(initialData?.longDescription || "");

      const newImage = entityType === "category"
        ? initialData?.homeImage || null
        : initialData?.image || null;
      setImage(newImage);

      setHeroImage(initialData?.heroImage || null);
      setCategorySlug(initialData?.categorySlug || "");

      // Handle additional images for products
      if (entityType === "products") {
        const initialImages = initialData?.images ? [...initialData.images] : [];
        while (initialImages.length < 3) {
          initialImages.push({ url: "", alt: "", title: "", caption: "", description: "", public_id: "" });
        }
        setAdditionalImages(initialImages.slice(0, 3));
      }
    }
  }, [initialData, reset, entityType]);

  useEffect(() => {
    if (entityType === "products") {
      const fetchCategories = async () => {
        try {
          const res = await fetch(
            "https://custompackboxes.com/api/category",
            {
              next: { revalidate: 0 },
            }
          );
          if (res.ok) {
            const data = await res.json();
            setCategories(data);
          } else {
            toast.error("Failed to fetch categories");
          }
        } catch (err) {
          toast.error("Error fetching categories");
        }
      };
      fetchCategories();
    }
  }, [entityType]);

  const processImage = async (
    imageObject,
    initialImageObject
  ) => {
    if (!imageObject) {
      // Image was removed
      if (initialImageObject?.public_id) {
        await handleDelete(initialImageObject.public_id);
      }
      return null;
    }

    if (imageObject.file) {
      // New file to upload
      if (initialImageObject?.public_id) {
        await handleDelete(initialImageObject.public_id);
      }
      const uploadResult = await handleUpload(imageObject.file);
      return {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        alt: imageObject.alt || "",
        title: imageObject.title || "",
        caption: imageObject.caption || "",
        description: imageObject.description || "",
      };
    }

    // No changes to the file, just return the metadata
    return imageObject;
  };

  // Function to handle additional image changes
  const handleAdditionalImageChange = (index, field, value) => {
    const updatedImages = [...additionalImages];

    if (field === 'image') {
      // When the entire image object changes (from ImageUpload)
      if (value === null) {
        // Image was removed
        updatedImages[index] = { url: "", alt: "", title: "", caption: "", description: "", public_id: "" };
      } else {
        updatedImages[index] = {
          ...updatedImages[index],
          ...value
        };
      }
    } else {
      // When individual fields change
      updatedImages[index] = {
        ...updatedImages[index],
        [field]: value
      };
    }

    setAdditionalImages(updatedImages);
  };

  // Process all additional images
  const processAdditionalImages = async () => {
    const processedImages = [];

    for (let i = 0; i < additionalImages.length; i++) {
      const currentImage = additionalImages[i];
      const initialImageData = initialData?.images?.[i] || null;

      // If image has no URL and no file, it's empty - skip it
      if (!currentImage.url && !currentImage.file) {
        // If there was an initial image, delete it
        if (initialImageData?.public_id) {
          await handleDelete(initialImageData.public_id);
        }
        continue;
      }

      // If there's a file to upload or image to process
      if (currentImage.file || currentImage.url) {
        const processedImage = await processImage(
          currentImage,
          initialImageData
        );
        if (processedImage) {
          processedImages.push(processedImage);
        }
      } else {
        // No changes to the image, just keep the existing data
        processedImages.push(currentImage);
      }
    }

    return processedImages;
  };

  // Function to handle image download
  const handleDownloadImage = (imageUrl, imageName = "image") => {
    if (!imageUrl) {
      toast.error("No image available to download");
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${imageName}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  const onSubmit = async (data) => {
    console.log("Form data submitted:", data);
    setIsLoading(true);
    try {
      const newImageData = await processImage(
        image,
        entityType === "category"
          ? initialData?.homeImage
          : initialData?.image
      );
      let newHeroImageData = heroImage;
      if (entityType === "category") {
        newHeroImageData = await processImage(
          heroImage,
          initialData?.heroImage
        );
      }

      // Process additional images for products
      let processedAdditionalImages = [];
      if (entityType === "products") {
        processedAdditionalImages = await processAdditionalImages();
      }

      const formData = {
        ...data,
        longDescription,
        ...(entityType === "category"
          ? { homeImage: newImageData, heroImage: newHeroImageData }
          : {
            image: newImageData,
            ...(entityType === "products" && {
              images: processedAdditionalImages
            })
          }),
        ...(entityType === "products" && {
          categorySlug,
        }),
      };

      const res = await fetch(
        initialData?._id
          ? `https://custompackboxes.com/api/${entityType}/${initialData._id}`
          : `https://custompackboxes.com/api/${entityType}`,
        {
          method: initialData?._id ? "PUT" : "POST",
          next: { revalidate: 0 },
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.err || `Failed to save ${entityType}`);
      }

      toast.success(
        `${entityType.charAt(0).toUpperCase() + entityType.slice(1)
        } ${initialData?._id ? "Updated" : "Created"} Successfully`
      );

      router.push(`/${rePush}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData?._id ? `Edit` : `New`} {entityType}
        </CardTitle>
        <CardDescription>
          Fill in the details to{" "}
          {initialData?._id ? "update your" : "create a new"} {entityType}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Name
            </Label>
            <Input
              id="name"
              placeholder={`${entityType} name`}
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">
              {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Slug
            </Label>
            <Input
              id="slug"
              placeholder={`${entityType}-slug`}
              {...register("slug", { required: "Slug is required" })}
            />
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="heading">Heading</Label>
          <Input
            id="heading"
            placeholder={`${entityType} heading`}
            {...register("heading", { required: "Heading is required" })}
          />
          {errors.heading && (
            <p className="text-sm text-red-500">{errors.heading.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="h1">H1 Tag</Label>
          <Input
            id="h1"
            placeholder={`${entityType} H1`}
            {...register("h1")}
          />
          {errors.h1 && (
            <p className="text-sm text-red-500">{errors.h1.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Short Description</Label>
          <Textarea
            id="description"
            placeholder={`Short description of the ${entityType}`}
            {...register("shortDescription", {
              required: "Description is required",
            })}
          />
          {errors.shortDescription && (
            <p className="text-sm text-red-500">
              {errors.shortDescription.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            placeholder={`${entityType} tagline`}
            {...register("tagline")}
          />
        </div>

        <div className="space-y-2">
          <Label>Long Description</Label>
          <RichTextEditor
            value={longDescription}
            onChange={setLongDescription}
          />
        </div>

        {entityType === "products" && (
          <div className="space-y-2">
            <Label htmlFor="categorySlug">Category</Label>
            <Select
              value={categorySlug}
              onValueChange={(value) => {
                setCategorySlug(value);
                setValue("categorySlug", value, { shouldValidate: true });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categorySlug && (
              <p className="text-sm text-red-500">
                {errors.categorySlug.message}
              </p>
            )}
          </div>
        )}

        {/* Main Product Image + 3 Additional Images */}
        {entityType === "products" && (
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Product Images</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Upload up to 4 images for your product. The first image will be used as the main product image.
              </p>

              {/* Main Product Image */}
              <div className="space-y-4 mb-8">
                <h4 className="font-medium text-base">Main Product Image</h4>
                <div className="space-y-2">
                  <ImageUpload
                    initialImage={
                      initialData?.image || null
                    }
                    onImageChange={setImage}
                  />
                  {image?.url && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-blue-500 text-white hover:bg-blue-200 "
                        size="sm"
                        onClick={() => handleDownloadImage(image.url, "main-product-image")}
                      >
                        Download Image
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This will be the primary image displayed for your product. Recommended size: 800x600px
                  </p>
                </div>
              </div>

              {/* Additional Product Images */}
              <div className="space-y-6">
                <h4 className="font-medium text-base">Additional Product Images</h4>
                <div className="grid grid-cols-1 gap-6">
                  {additionalImages.map((additionalImage, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4 bg-muted/5">
                      <h5 className="font-medium">Additional Image {index + 1}</h5>

                      <div className="space-y-2">
                        <Label>Image</Label>
                        <ImageUpload
                          initialImage={additionalImage}
                          onImageChange={(image) =>
                            handleAdditionalImageChange(index, 'image', image)
                          }
                        />
                        {additionalImage?.url && (
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              className="bg-blue-500 text-white hover:bg-blue-200 "
                              size="sm"
                              onClick={() => handleDownloadImage(additionalImage.url, `additional-image-${index + 1}`)}
                            >
                              Download Image
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Recommended size: 800x600px
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Alt Text</Label>
                          <Input
                            placeholder="Enter alt text for accessibility"
                            value={additionalImage.alt || ""}
                            onChange={(e) =>
                              handleAdditionalImageChange(index, 'alt', e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Caption</Label>
                          <Input
                            placeholder="Enter image caption"
                            value={additionalImage.caption || ""}
                            onChange={(e) =>
                              handleAdditionalImageChange(index, 'caption', e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          placeholder="Enter image title"
                          value={additionalImage.title || ""}
                          onChange={(e) =>
                            handleAdditionalImageChange(index, 'title', e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Enter detailed description"
                          value={additionalImage.description || ""}
                          onChange={(e) =>
                            handleAdditionalImageChange(index, 'description', e.target.value)
                          }
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Images (only show if not products) */}
        {entityType !== "products" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                {entityType === "category" ? "Main Image" : "Product Image"}
              </Label>
              <ImageUpload
                initialImage={
                  entityType === "category"
                    ? initialData?.homeImage
                    : initialData?.image
                }
                onImageChange={setImage}
              />
              {image?.url && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-200 "
                    onClick={() => handleDownloadImage(
                      image.url,
                      entityType === "category" ? "main-category-image" : "product-image"
                    )}
                  >
                    Download Image
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Recommended size: 800x600px
              </p>
            </div>

            {entityType === "category" && (
              <div className="space-y-2">
                <Label>Hero Image</Label>
                <ImageUpload
                  initialImage={initialData?.heroImage}
                  onImageChange={setHeroImage}
                />
                {heroImage?.url && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-blue-500 text-white hover:bg-blue-200 "
                      size="sm"
                      onClick={() => handleDownloadImage(heroImage.url, "hero-image")}
                    >
                      Download Image
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Recommended size: 1920x1080px
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${rePush}`)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : `Save ${entityType}`}
        </Button>
      </CardFooter>
    </Card>
  );
}