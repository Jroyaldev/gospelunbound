import { createApi } from 'unsplash-js';

// Initialize the Unsplash API client
const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '',
});

export type UnsplashImage = {
  id: string;
  url: string;
  blurHash: string;
  description: string | null;
  alt: string;
  credit: {
    name: string;
    link: string;
  };
};

export async function getUnsplashImage(query: string): Promise<UnsplashImage | null> {
  try {
    const result = await unsplash.photos.getRandom({
      query,
      orientation: 'landscape',
    });

    if (result.type === 'error') {
      console.error('Unsplash API error:', result.errors[0]);
      return null;
    }

    const photo = result.response;
    if (!photo) return null;

    return {
      id: photo.id,
      url: photo.urls.regular,
      blurHash: photo.blur_hash || '',
      description: photo.description,
      alt: photo.alt_description || photo.description || query,
      credit: {
        name: photo.user.name,
        link: photo.user.links.html,
      },
    };
  } catch (error) {
    console.error('Error fetching Unsplash image:', error);
    return null;
  }
}

export async function getUnsplashImages(query: string, count: number = 1): Promise<UnsplashImage[]> {
  try {
    const result = await unsplash.photos.getRandom({
      query,
      orientation: 'landscape',
      count,
    });

    if (result.type === 'error') {
      console.error('Unsplash API error:', result.errors[0]);
      return [];
    }

    const photos = Array.isArray(result.response) ? result.response : [result.response];
    
    return photos.map(photo => ({
      id: photo.id,
      url: photo.urls.regular,
      blurHash: photo.blur_hash || '',
      description: photo.description,
      alt: photo.alt_description || photo.description || query,
      credit: {
        name: photo.user.name,
        link: photo.user.links.html,
      },
    }));
  } catch (error) {
    console.error('Error fetching Unsplash images:', error);
    return [];
  }
}
