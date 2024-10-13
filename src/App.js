import {useEffect, useState} from "react";
import {Card, CardContent} from "@mui/material";

const UnsplashPhotoGrid = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPhotos()
    }, [])

    const fetchPhotos = () => {
        setLoading(true);
        try {
            // todo fetch photos from unsplashAPI

            const mockData = Array(12).fill().map((_, index) => ({
                id: index,
                urls: {thumb: `/api/placeholder/400/${300 + index * 10}`},
                user: {
                    name: `Photographer ${index + 1}`
                }
            }))

            setPhotos(mockData);
        } catch (e) {
            setError("Failed to fetch photos");
        } finally {
            setLoading(false);
        }
    }

    // if (loading) {
    //     return <div className="text-center">Loading...</div>
    // }
    //
    // if (error) {
    //     return <div className="text-center text-red-500">Error: {error}</div>;
    // }


    return (
        <div className="container">
            <h1 className="text-3xl font-bold underline">Unsplash API Photo</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, _) => (
                    <Card key={photo.id}>
                        <CardContent>
                            <img
                                src={photo.urls.thumb}
                                alt={`Photo by ${photo.user.name}`}
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default UnsplashPhotoGrid;
