import {useCallback, useEffect, useRef, useState} from "react";
import {Card, CardContent} from "@mui/material";
import {createApi} from "unsplash-js";
import axios from 'axios'

const UnsplashPhotoGrid = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef();
    const lastPhotoElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const unsplash = createApi({
        apiKey: process.env.UNSPLASH_API_ACCESS_KEY,
    })
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.unsplash.com/photos/?client_id={}`,
        headers: {}
    };

    useEffect(() => {
        fetchPhotos()
    }, [page])

    function mockData() {
        const mockData = Array(12).fill().map((_, index) => ({
            id: index,
            urls: {thumb: `/api/placeholder/400/${300 + index * 10}`},
            user: {
                name: `Photographer ${index + 1}`
            }
        }))
        return mockData;
    }

    const fetchPhotos = async () => {
        setLoading(true);
        try {
            // axios.request(config)
            //     .then((response) => {
            //         console.log(response.data);
            //         const list = response.data;
            //         const photos = list.map((item, _) => ({
            //             id: item?.id,
            //             urls: {thumb: item?.urls?.thumb},
            //             user: {
            //                 name: `Photographer ${item?.user?.name}`,
            //             }
            //         }))
            //
            //         setPhotos(photos);
            //     })
            //     .catch((error) => {
            //         console.log(error);
            //         setPhotos(mockData)
            //     });

            const response = await axios.request(config)
            console.log('response: ', response)
            const list = response.data
            if (list.length === 0) {
                setHasMore(false);
            } else {
                const list = response.data;
                const newPhotos = list.map((item, _) => ({
                    id: item?.id,
                    urls: {thumb: item?.urls?.thumb},
                    user: {
                        name: `Photographer ${item?.user?.name}`,
                    }
                }))
                setPhotos(prevPhotos => [...prevPhotos, ...newPhotos]);
            }
        } catch (e) {
            setError("Failed to fetch photos");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="text-center py-8">Loading...</div>
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    }


    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold underline">Unsplash API Photo</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                    <Card key={photo.id}
                          className="overflow-hidden"
                          ref={photos.length === index + 1 ? lastPhotoElementRef : null}
                    >
                        <CardContent className="p-0">
                            <img
                                src={photo.urls.thumb}
                                alt={`Photo by ${photo.user.name}`}
                                className="w-full h-48 object-cover"
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>
            {loading && (
                <div className="text-center py-4">
                    <p>Đang tải thêm ảnh...</p>
                </div>
            )}
            {!hasMore && <p className="text-center py-4">Không còn ảnh để tải.</p>}

        </div>
    )
}

export default UnsplashPhotoGrid;
