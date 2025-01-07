// "use client";
// import { useState, useEffect } from "react";

// interface InstagramAuthResponse {
//   access_token: string;
//   user_id: string;
// }

// interface UserData {
//   id: string;
//   username: string;
//   account_type: string;
//   followers_count: number;
//   follows_count: number;
//   media_count: number;
//   profile_picture_url: string;
// }

// interface CarouselItem {
//   id: string;
//   media_type: string;
//   media_url: string;
// }

// interface MediaItem {
//   id: string;
//   caption?: string;
//   media_type: string;
//   media_url?: string;
//   timestamp?: string;
//   like_count: number;
//   comments_count: number;
//   children?: {
//     data: CarouselItem[];
//   };
//   insights?: {
//     data: Array<{
//       name: string;
//       values: Array<{
//         value: number;
//       }>;
//     }>;
//   };
// }

// interface AccountInsights {
//   impressions: number;
//   reach: number;
//   profile_views: number;
//   website_clicks: number;
//   total_interactions: number;
//   accounts_engaged: number;
// }

// export default function Home() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [mediaData, setMediaData] = useState<MediaItem[]>([]);
//   const [accountInsights, setAccountInsights] =
//     useState<AccountInsights | null>(null);
//   const [currentSlides, setCurrentSlides] = useState<Record<string, number>>(
//     {}
//   );
//   const INSTAGRAM_APP_ID = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
//   const REDIRECT_URI = "https://localhost:3001/";

//   const loginWithInstagram = () => {
//     const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=1135956088244248&redirect_uri=https://localhost:3001/&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish`;
//     window.location.href = authUrl;
//   };

//   useEffect(() => {
//     const savedToken = localStorage.getItem("instagram_token");
//     if (savedToken) {
//       setIsLoggedIn(true);
//       fetchUserData(savedToken);
//       fetchUserData(savedToken);
//       console.log("token", savedToken);
//     } else {
//       const urlParams = new URLSearchParams(window.location.search);
//       const code = urlParams.get("code");
//       if (code) {
//         exchangeCodeForToken(code);
//       }
//     }
//   }, []);

//   const exchangeCodeForToken = async (code: string) => {
//     try {
//       const response = await fetch("/api/auth/instagram", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           code,
//           redirect_uri: REDIRECT_URI,
//         }),
//       });

//       const data = await response.json();

//       if (data.access_token) {
//         console.log("token", data.access_token);
//         const longLivedToken = await getLongLivedToken(data.access_token);
//         localStorage.setItem("instagram_token", longLivedToken);
//         setIsLoggedIn(true);

//         fetchUserData(longLivedToken);
//         console.log(longLivedToken);
//         window.history.replaceState(
//           {},
//           document.title,
//           window.location.pathname
//         );
//       } else {
//         console.error("No access token received:", data);
//         localStorage.removeItem("instagram_token");
//         setIsLoggedIn(false);
//       }
//     } catch (error) {
//       console.error("Error exchanging code for token:", error);
//       localStorage.removeItem("instagram_token");
//       setIsLoggedIn(false);
//     }
//   };

//   const getLongLivedToken = async (shortLivedToken: string) => {
//     try {
//       const response = await fetch("/api/auth/instagram/long-lived", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ access_token: shortLivedToken }),
//       });
//       const data = await response.json();
//       return data.access_token || shortLivedToken;
//     } catch (error) {
//       console.error("Error getting long-lived token:", error);
//       return shortLivedToken;
//     }
//   };

//   const fetchUserData = async (accessToken: string) => {
//     try {
//       const response = await fetch(
//         `https://graph.instagram.com/me?fields=id,username,account_type,profile_picture_url,followers_count,follows_count,media_count&access_token=${accessToken}`
//       );
//       const data = await response.json();

//       if (data.error) {
//         console.error("Instagram API error:", data.error);
//         localStorage.removeItem("instagram_token");
//         setIsLoggedIn(false);
//         return;
//       }

//       setUserData(data);
//       if (data.id) {
//         console.log("id:", data.id);
//         fetchAccountInsights(data.id, accessToken);
//         fetchMediaInsights(data.id, accessToken);
//       }
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//       localStorage.removeItem("instagram_token");
//       setIsLoggedIn(false);
//     }
//   };

//   const formatDate = (timestamp: string) => {
//     return new Date(timestamp).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const fetchMediaInsights = async (userId: string, accessToken: string) => {
//     try {
//       // First fetch media IDs and basic info
//       const mediaResponse = await fetch(
//         `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,timestamp,children{media_type,media_url}&access_token=${accessToken}`
//       );
//       const mediaList = await mediaResponse.json();

//       if (!mediaList.data) {
//         throw new Error("No media data found");
//       }

//       // Initialize carousel positions for all media items
//       const initialSlides: Record<string, number> = {};
//       mediaList.data.forEach((media: MediaItem) => {
//         initialSlides[media.id] = 0;
//       });
//       setCurrentSlides(initialSlides);

//       // For each media item, fetch detailed data and insights
//       const detailedMediaData = await Promise.all(
//         mediaList.data.map(async (media: any) => {
//           try {
//             // Fetch detailed media data
//             const mediaDetailsResponse = await fetch(
//               `https://graph.instagram.com/${media.id}?fields=id,media_type,media_url,like_count,comments_count,timestamp,children{media_type,media_url}&access_token=${accessToken}`
//             );
//             const mediaDetails = await mediaDetailsResponse.json();

//             // Fetch insights for this media
//             const insightsResponse = await fetch(
//               `https://graph.instagram.com/${
//                 media.id
//               }/insights?metric=engagement,impressions,reach,saved${
//                 mediaDetails.media_type === "VIDEO" ? ",video_views" : ""
//               }&access_token=${accessToken}`
//             );
//             const insightsData = await insightsResponse.json();

//             return {
//               ...mediaDetails,
//               caption: media.caption,
//               insights: insightsData,
//             };
//           } catch (error) {
//             console.error(
//               `Error fetching details for media ${media.id}:`,
//               error
//             );
//             return {
//               id: media.id,
//               caption: media.caption,
//               media_type: "unknown",
//               timestamp: new Date().toISOString(),
//               like_count: 0,
//               comments_count: 0,
//             };
//           }
//         })
//       );

//       setMediaData(detailedMediaData);
//     } catch (error) {
//       console.error("Error fetching media insights:", error);
//     }
//   };

//   const fetchAccountInsights = async (userId: string, accessToken: string) => {
//     try {
//       // Get recent media first
//       const mediaResponse = await fetch(
//         `https://graph.instagram.com/me/media?fields=id,like_count,comments_count&access_token=${accessToken}`
//       );
//       const mediaData = await mediaResponse.json();
//       console.log("Media Data:", mediaData);

//       let totalLikes = 0;
//       let totalComments = 0;

//       if (mediaData.data) {
//         mediaData.data.forEach((media: any) => {
//           totalLikes += media.like_count || 0;
//           totalComments += media.comments_count || 0;
//         });
//       }

//       // Set insights based on available data
//       const processedInsights: AccountInsights = {
//         profile_views: 0,
//         reach: totalLikes + totalComments, // Approximation
//         impressions: totalLikes * 3, // Rough estimate
//         total_interactions:
//           totalLikes + totalComments + (totalLikes * 3 + totalComments * 3),
//         website_clicks: 0,
//         accounts_engaged: 0,
//       };

//       setAccountInsights(processedInsights);
//     } catch (error) {
//       console.error("Error fetching insights:", error);
//     }
//   };

//   const handlePrevSlide = (mediaId: string) => {
//     setCurrentSlides((prev) => ({
//       ...prev,
//       [mediaId]: Math.max(0, (prev[mediaId] || 0) - 1),
//     }));
//   };

//   const handleNextSlide = (mediaId: string, maxSlides: number) => {
//     setCurrentSlides((prev) => ({
//       ...prev,
//       [mediaId]: Math.min(maxSlides - 1, (prev[mediaId] || 0) + 1),
//     }));
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("instagram_token");
//     setIsLoggedIn(false);
//     setUserData(null);
//     setMediaData([]);
//   };

//   return (
//     <main className="min-h-screen bg-gray-100">
//       <div className="container mx-auto p-8">
//         {!isLoggedIn ? (
//           <div className="flex justify-center items-center h-96">
//             <button
//               onClick={loginWithInstagram}
//               className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg text-lg font-medium hover:opacity-90 transition-opacity"
//             >
//               Login with Instagram
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-8">
//             <div className="flex justify-end">
//               <button
//                 onClick={handleLogout}
//                 className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
//               >
//                 Logout
//               </button>
//             </div>

//             {userData && (
//               <div className="bg-white p-6 rounded-lg shadow-lg">
//                 <div className="flex items-center gap-6">
//                   <img
//                     src={userData.profile_picture_url}
//                     alt={userData.username}
//                     className="w-24 h-24 rounded-full"
//                   />
//                   <div>
//                     <h2 className="text-2xl font-bold mb-2">
//                       @{userData.username}
//                     </h2>
//                     <div className="grid grid-cols-3 gap-6">
//                       <div>
//                         <p className="text-gray-600">Followers</p>
//                         <p className="text-xl font-bold">
//                           {userData.followers_count}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-gray-600">Following</p>
//                         <p className="text-xl font-bold">
//                           {userData.follows_count}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-gray-600">Posts</p>
//                         <p className="text-xl font-bold">
//                           {userData.media_count}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {accountInsights && (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
//                 <div className="bg-white p-6 rounded-lg shadow-lg">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4">
//                     Reach & Impressions
//                   </h3>
//                   <div className="space-y-4">
//                     <div>
//                       <p className="text-gray-600">Impressions</p>
//                       <p className="text-2xl font-bold">
//                         {accountInsights.impressions.toLocaleString()}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-gray-600">Reach</p>
//                       <p className="text-2xl font-bold">
//                         {accountInsights.reach.toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white p-6 rounded-lg shadow-lg">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4">
//                     Profile Activity
//                   </h3>
//                   <div className="space-y-4">
//                     <div>
//                       <p className="text-gray-600">Profile Views</p>
//                       <p className="text-2xl font-bold">
//                         {accountInsights.profile_views.toLocaleString()}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-gray-600">Website Clicks</p>
//                       <p className="text-2xl font-bold">
//                         {accountInsights.website_clicks.toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white p-6 rounded-lg shadow-lg">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4">
//                     Engagement
//                   </h3>
//                   <div className="space-y-4">
//                     <div>
//                       <p className="text-gray-600">Total Interactions</p>
//                       <p className="text-2xl font-bold">
//                         {accountInsights.total_interactions.toLocaleString()}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-gray-600">Accounts Engaged</p>
//                       <p className="text-2xl font-bold">
//                         {accountInsights.accounts_engaged.toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="space-y-6">
//               {mediaData.map((media) => (
//                 <div
//                   key={media.id}
//                   className="bg-white rounded-lg shadow-lg overflow-hidden"
//                 >
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
//                     {/* Media Section */}
//                     <div className="relative h-96">
//                       {media.media_type === "IMAGE" && media.media_url && (
//                         <img
//                           src={media.media_url}
//                           alt={media.caption || "Instagram post"}
//                           className="w-full h-full object-cover"
//                         />
//                       )}
//                       {media.media_type === "VIDEO" && media.media_url && (
//                         <video
//                           src={media.media_url}
//                           controls
//                           className="w-full h-full object-cover"
//                         >
//                           Your browser does not support the video tag.
//                         </video>
//                       )}
//                       {media.media_type === "CAROUSEL_ALBUM" &&
//                         media.children && (
//                           <div className="relative h-full">
//                             {/* Carousel Navigation */}
//                             {media.children.data.length > 1 && (
//                               <>
//                                 <button
//                                   onClick={() => handlePrevSlide(media.id)}
//                                   className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 ${
//                                     currentSlides[media.id] === 0
//                                       ? "hidden"
//                                       : ""
//                                   }`}
//                                 >
//                                   ←
//                                 </button>
//                                 <button
//                                   onClick={() =>
//                                     handleNextSlide(
//                                       media.id,
//                                       media.children!.data.length
//                                     )
//                                   }
//                                   className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 ${
//                                     currentSlides[media.id] ===
//                                     media.children.data.length - 1
//                                       ? "hidden"
//                                       : ""
//                                   }`}
//                                 >
//                                   →
//                                 </button>
//                               </>
//                             )}
//                             {/* Carousel Items */}
//                             {media.children.data.map((item, index) => (
//                               <div
//                                 key={item.id}
//                                 className={`absolute inset-0 transition-opacity duration-300 ${
//                                   index === currentSlides[media.id]
//                                     ? "opacity-100"
//                                     : "opacity-0 pointer-events-none"
//                                 }`}
//                               >
//                                 {item.media_type === "VIDEO" ? (
//                                   <video
//                                     src={item.media_url}
//                                     controls
//                                     className="w-full h-full object-cover"
//                                   >
//                                     Your browser does not support the video tag.
//                                   </video>
//                                 ) : (
//                                   <img
//                                     src={item.media_url}
//                                     alt={`Carousel item ${index + 1}`}
//                                     className="w-full h-full object-cover"
//                                   />
//                                 )}
//                               </div>
//                             ))}
//                             {/* Carousel Indicators */}
//                             <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
//                               {media.children.data.map((_, index) => (
//                                 <div
//                                   key={index}
//                                   className={`h-2 w-2 rounded-full ${
//                                     index === currentSlides[media.id]
//                                       ? "bg-white"
//                                       : "bg-white/50"
//                                   }`}
//                                 />
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                     </div>

//                     {/* Content Section */}
//                     <div className="p-6 flex flex-col h-96 overflow-y-auto">
//                       {/* Post Info */}
//                       <div className="mb-4">
//                         <p className="text-sm text-gray-500 mb-2">
//                           {media.timestamp && formatDate(media.timestamp)}
//                         </p>
//                         <p className="text-gray-800 whitespace-pre-wrap">
//                           {media.caption || "No caption"}
//                         </p>
//                       </div>

//                       {/* Engagement Stats */}
//                       <div className="grid grid-cols-2 gap-4 mb-6">
//                         <div>
//                           <p className="text-gray-600">Likes</p>
//                           <p className="text-xl font-bold">
//                             {media.like_count || 0}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-gray-600">Comments</p>
//                           <p className="text-xl font-bold">
//                             {media.comments_count || 0}
//                           </p>
//                         </div>
//                       </div>

//                       {/* Insights */}
//                       {media.insights?.data && (
//                         <div className="grid grid-cols-2 gap-4">
//                           <div>
//                             <p className="text-gray-600">Engagement</p>
//                             <p className="text-lg font-bold">
//                               {media.insights.data.find(
//                                 (d) => d.name === "engagement"
//                               )?.values[0]?.value || 0}
//                             </p>
//                           </div>
//                           <div>
//                             <p className="text-gray-600">Reach</p>
//                             <p className="text-lg font-bold">
//                               {media.insights.data.find(
//                                 (d) => d.name === "reach"
//                               )?.values[0]?.value || 0}
//                             </p>
//                           </div>
//                           <div>
//                             <p className="text-gray-600">Impressions</p>
//                             <p className="text-lg font-bold">
//                               {media.insights.data.find(
//                                 (d) => d.name === "impressions"
//                               )?.values[0]?.value || 0}
//                             </p>
//                           </div>
//                           <div>
//                             <p className="text-gray-600">Saved</p>
//                             <p className="text-lg font-bold">
//                               {media.insights.data.find(
//                                 (d) => d.name === "saved"
//                               )?.values[0]?.value || 0}
//                             </p>
//                           </div>
//                           {media.media_type === "VIDEO" && (
//                             <div className="col-span-2">
//                               <p className="text-gray-600">Video Views</p>
//                               <p className="text-lg font-bold">
//                                 {media.insights.data.find(
//                                   (d) => d.name === "video_views"
//                                 )?.values[0]?.value || 0}
//                               </p>
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }
"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Facebook,
  Sparkles,
  Star,
} from "lucide-react";

const GradientBlob = ({ className = "" }) => (
  <div
    className={`absolute rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob ${className}`}
  />
);

const ShiningButton = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:scale-105 transition-all duration-300 group ${className}`}
  >
    <div className="absolute inset-0 flex">
      <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[45deg] animate-shine group-hover:animate-shine-fast" />
    </div>
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/50 to-blue-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative flex items-center gap-2">{children}</div>
  </button>
);

const FloatingElement = ({
  children,
  className = "",
  amplitude = 10,
  speed = 1000,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const time = Date.now() / speed;
      setPosition({
        x: Math.sin(time) * amplitude,
        y: Math.cos(time) * amplitude,
      });
    }, 50);

    return () => clearInterval(interval);
  }, [amplitude, speed]);

  return (
    <div
      className={`absolute transition-transform duration-300 ${className}`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      {children}
    </div>
  );
};

const SparkleEffect = () => (
  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200" />
);

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const loginWithInstagram = () => {
    const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=1135956088244248&redirect_uri=https://localhost:3001/&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish`;
    window.location.href = authUrl;
  };

  const handleMouseMove = (e) => {
    setMousePosition({
      x: (e.clientX - window.innerWidth / 2) / 30,
      y: (e.clientY - window.innerHeight / 2) / 30,
    });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50 overflow-hidden relative"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background Gradients */}
      <GradientBlob className="bg-purple-300 top-0 left-20 w-72 h-72 animate-blob" />
      <GradientBlob className="bg-blue-300 top-0 right-20 w-72 h-72 animate-blob animation-delay-2000" />
      <GradientBlob className="bg-pink-300 bottom-0 left-20 w-72 h-72 animate-blob animation-delay-4000" />

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center relative z-20">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 flex items-center gap-2">
          <div className="relative group">
            <SparkleEffect />
            <div className="relative bg-black rounded-full w-10 h-10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>
          SocialAI
        </div>

        <div className="flex items-center gap-8">
          <button className="text-gray-600 hover:text-gray-800 transition-colors relative group">
            Features
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
          </button>
          <button className="text-gray-600 hover:text-gray-800 transition-colors relative group">
            Pricing
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
          </button>
          <ShiningButton
            onClick={loginWithInstagram}
            className="px-6 py-2 text-base"
          >
            Get Started <ChevronRight className="w-4 h-4" />
          </ShiningButton>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 relative">
            <FloatingElement
              className="top-0 right-1/4"
              amplitude={15}
              speed={2000}
            >
              <Star className="w-8 h-8 text-yellow-400 animate-spin-slow" />
            </FloatingElement>

            <div className="inline-block mb-6">
              <div className="px-6 py-2 bg-white/80 backdrop-blur rounded-full border border-purple-100 shadow-lg flex items-center gap-2 group hover:bg-white/90 transition-colors">
                <span className="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Powered by 
                </span>
              </div>
            </div>

            <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
              One-stop platform
            </h1>
            <h2 className="text-6xl font-bold mb-8 text-gray-800">
              Everything you need to grow on social
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              SocialAI offers everything you need to manage your social media
              posts, build a dedicated audience, create leads, and grow your
              business.
            </p>

            {/* Main CTA */}
            <div className="relative group inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-300 group-hover:duration-200 animate-pulse" />
              <ShiningButton onClick={loginWithInstagram} className="relative">
                Get Started <ChevronRight className="w-5 h-5" />
              </ShiningButton>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center gap-8 mb-16">
            {[Instagram, Youtube, Twitter, Linkedin, Facebook].map(
              (Icon, index) => (
                <div key={index} className="relative group">
                  <SparkleEffect />
                  <div className="relative p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer">
                    <Icon
                      className={`w-6 h-6 ${
                        index === 0
                          ? "text-pink-500"
                          : index === 1
                          ? "text-red-500"
                          : index === 2
                          ? "text-blue-400"
                          : index === 3
                          ? "text-blue-600"
                          : "text-blue-800"
                      }`}
                    />
                  </div>
                </div>
              )
            )}
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {["AI Analytics", "Smart Content", "Growth Insights"].map(
              (title, index) => (
                <div key={index} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-300" />
                  <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="mb-4">
                      <Star className="w-8 h-8 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {title}
                    </h3>
                    <p className="text-gray-600">
                      Advanced AI-powered features to enhance your social media
                      presence.
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes shine {
          from {
            transform: translateX(-100%) skewX(45deg);
          }
          to {
            transform: translateX(200%) skewX(45deg);
          }
        }
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -20px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 20px) scale(1.1);
          }
        }
        .animate-shine {
          animation: shine 3s infinite;
        }
        .animate-shine-fast {
          animation: shine 2s infinite;
        }
        .animate-gradient-x {
          animation: gradient-x 15s linear infinite;
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
      `}</style>
    </div>
  );
}
