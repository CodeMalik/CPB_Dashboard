import cloudinary from './cloudinary';

export const uploadImage = async (file) => {
  try {
    if (!file) return null;
    
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'custom-pack-boxes/blogs',
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 630, crop: 'fill', gravity: 'auto' }
      ]
    });
    
    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to upload image');
  }
};

export const deleteImage = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Image delete error:', error);
    throw new Error('Failed to delete image');
  }
};