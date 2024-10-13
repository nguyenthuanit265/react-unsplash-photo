import {useEffect, useState} from "react";

const UnsplashPhotoGrid = () => {
    const [photo, setPhoto] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

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

            setPhoto(mockData);
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
            <div>

            </div>
        </div>
    )
}

export default UnsplashPhotoGrid;
