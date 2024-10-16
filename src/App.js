import React, {memo, useCallback, useEffect, useRef, useState} from "react";
import {Button, Card, CardContent, Dialog, DialogContent, DialogTitle, IconButton} from "@mui/material";
import {BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate} from 'react-router-dom';
import {Close as CloseIcon} from "@mui/icons-material";

import axios from 'axios'

// Retrieve the Unsplash API key from environment variables
const UNSPLASH_API_KEY = process.env.REACT_APP_UNSPLASH_API_KEY;

// Main App component - Sets up routing for the application
const App = () => {
    return (
        <Router basename={process.env.PUBLIC_URL}>
            <Routes>
                <Route path="/" element={<UnsplashPhotoGrid/>}/>
                <Route path="/photos/:id" element={<PhotoDetail/>}/>
            </Routes>
        </Router>
    );
};

// PhotoDetail component - Displays detailed information about a single photo
const PhotoDetail = () => {
    const {id} = useParams();
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPhotoDetail = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`https://api.unsplash.com/photos/${id}`, {
                    params: {
                        client_id: UNSPLASH_API_KEY
                    }
                });
                setPhoto(response.data);
            } catch (e) {
                setError("Failed to fetch photo details");
            } finally {
                setLoading(false);
            }
        };

        fetchPhotoDetail();
    }, [id]);

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    if (!photo) return <div className="text-center py-8">Photo not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Button onClick={() => navigate('/')} variant="contained" className="mb-4">Back to Gallery</Button>
            <h2 className="text-2xl font-bold mb-4">{photo.title || "Untitled"}</h2>
            <img
                src={photo.urls.regular}
                alt={photo.title || `Ảnh bởi ${photo.user.name}`}
                className="w-full h-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">By {photo.user.name}</h3>
            <p className="mb-4">{photo.description || "Không có mô tả cho ảnh này."}</p>
        </div>
    );
};

// PhotoCard component - Renders individual photo cards in the grid
const PhotoCard = memo(React.forwardRef(({photo, onClick}, ref) => (
    <Card ref={ref} className="overflow-hidden cursor-pointer" onClick={() => onClick(photo)}>
        <CardContent className="p-0">
            <img
                src={photo.urls.thumb}
                alt={`Photo by ${photo.user.name}`}
                className="w-full h-48 object-cover"
            />
        </CardContent>
        <div className="p-2">
            <p className="text-sm font-medium">{photo.user.name}</p>
        </div>
    </Card>
)), (prevProps, nextProps) => prevProps.photo.id === nextProps.photo.id);

// PhotoDetailView component - Modal view for photo details (currently unused)
const PhotoDetailView = ({photo, onClose}) => {
    if (!photo) return null;

    return (
        <Dialog open={Boolean(photo)} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {photo.title || "Untitled"}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <img
                    src={photo.urls.regular}
                    alt={photo.title || `Ảnh bởi ${photo.user.name}`}
                    className="w-full h-auto mb-4"
                />
                <h3 className="text-xl font-bold mb-2">{photo.user.name}</h3>
                <p>{photo.description || "Không có mô tả cho ảnh này."}</p>
            </DialogContent>
        </Dialog>
    );
};

// UnsplashPhotoGrid component - Displays the grid of photos with infinite scroll
const UnsplashPhotoGrid = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const navigate = useNavigate();

    // Set up intersection observer for infinite scrolling
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

    const getConfig = (page) => {
        return {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.unsplash.com/photos/?page=${page}&&client_id=${UNSPLASH_API_KEY}`,
            headers: {}
        };
    }

    // Fetch photos from Unsplash API
    const fetchPhotos = useCallback(async () => {
        try {
            setLoading(true);
            // const response = await axios.request(getConfig(page))
            const response = await axios.get(`https://api.unsplash.com/photos/`, {
                params: {
                    page: page,
                    client_id: process.env.REACT_APP_UNSPLASH_API_KEY
                }
            });

            const list = response.data
            if (list.length === 0) {
                setHasMore(false);
            } else {
                const list = response.data;
                const newPhotos = list.map((item, _) => ({
                    id: item.id,
                    urls: {
                        thumb: item.urls.thumb,
                        regular: item.urls.regular
                    },
                    user: {
                        name: item.user.name,
                    },
                    title: item.title,
                    description: item.description
                }))
                setPhotos(prevPhotos => {
                    const uniqueNewPhotos = newPhotos.filter(
                        newPhoto => !prevPhotos.some(photo => photo.id === newPhoto.id)
                    );
                    return [...prevPhotos, ...uniqueNewPhotos];
                });
            }
        } catch (e) {
            setError("Failed to fetch photos");
        } finally {
            setLoading(false);
        }
    }, [page, loading, hasMore]);

    // Fetch photos when page changes
    useEffect(() => {
        fetchPhotos()
    }, [page])


    // const handlePhotoClick = (photo) => {
    //     setSelectedPhoto(photo);
    // };

    // Handle photo click - navigate to photo detail page
    const handlePhotoClick = (photoInfo) => {
        navigate(`/photos/${photoInfo.id}`);
    };

    const handleCloseDetail = () => {
        setSelectedPhoto(null);
    };

    // Render loading state
    if (loading) {
        return <div className="text-center py-8">Loading...</div>
    }

    // Render error state
    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    }

    // Render photo grid
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold underline">Unsplash API Photo</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                    <PhotoCard
                        key={`${photo.id}-${index}`}
                        photo={photo}
                        onClick={handlePhotoClick}
                        ref={photos.length === index + 1 ? lastPhotoElementRef : null}
                    />
                ))}
            </div>
            {loading && (
                <div className="text-center py-4">
                    <p>Đang tải thêm ảnh...</p>
                </div>
            )}
            {!hasMore && <p className="text-center py-4">Không còn ảnh để tải.</p>}
            <PhotoDetailView photo={selectedPhoto} onClose={handleCloseDetail}/>
        </div>
    )
}

export default App;
