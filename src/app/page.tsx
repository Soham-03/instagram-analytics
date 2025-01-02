'use client';
// import { useState, useEffect } from 'react';

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

// interface MediaItem {
//   id: string;
//   caption?: string;
//   media_type: string;
//   media_url?: string;
//   like_count: number;
//   comments_count: number;
//   insights?: {
//     data: Array<{
//       values: Array<{
//         value: number;
//       }>;
//     }>;
//   };
// }

// export default function Home() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [mediaData, setMediaData] = useState<MediaItem[]>([]);
//   const INSTAGRAM_APP_ID = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
//   const REDIRECT_URI = 'https://localhost:3001';

//   const loginWithInstagram = () => {
//     const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=1135956088244248&redirect_uri=https://localhost:3001/&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish`;
//     window.location.href = authUrl;
//   };

//   useEffect(() => {
//     const savedToken = localStorage.getItem('instagram_token');
//     if (savedToken) {
//       setIsLoggedIn(true);
//       fetchUserData(savedToken);
//     } else {
//       const urlParams = new URLSearchParams(window.location.search);
//       const code = urlParams.get('code');
//       if (code) {
//         exchangeCodeForToken(code);
//       }
//     }
//   }, []);

//   const exchangeCodeForToken = async (code: string) => {
//     try {
//       const response = await fetch('/api/auth/instagram', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           code,
//           redirect_uri: REDIRECT_URI
//         })
//       });
      
//       const data = await response.json();
      
//       if (data.access_token) {
//         const longLivedToken = await getLongLivedToken(data.access_token);
//         localStorage.setItem('instagram_token', longLivedToken);
//         setIsLoggedIn(true);
//         fetchUserData(longLivedToken);
//         window.history.replaceState({}, document.title, window.location.pathname);
//       } else {
//         console.error('No access token received:', data);
//         localStorage.removeItem('instagram_token');
//         setIsLoggedIn(false);
//       }
//     } catch (error) {
//       console.error('Error exchanging code for token:', error);
//       localStorage.removeItem('instagram_token');
//       setIsLoggedIn(false);
//     }
//   };

//   const getLongLivedToken = async (shortLivedToken: string) => {
//     try {
//       const response = await fetch('/api/auth/instagram/long-lived', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ access_token: shortLivedToken })
//       });
//       const data = await response.json();
//       return data.access_token || shortLivedToken;
//     } catch (error) {
//       console.error('Error getting long-lived token:', error);
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
//         console.error('Instagram API error:', data.error);
//         localStorage.removeItem('instagram_token');
//         setIsLoggedIn(false);
//         return;
//       }
      
//       setUserData(data);
//       if (data.id) {
//         fetchMediaInsights(data.id, accessToken);
//       }
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//       localStorage.removeItem('instagram_token');
//       setIsLoggedIn(false);
//     }
//   };

//   const fetchMediaInsights = async (userId: string, accessToken: string) => {
//     try {
//       const response = await fetch(
//         `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,insights.metric(impressions,reach)&access_token=${accessToken}`
//       );
//       const data = await response.json();
//       setMediaData(data.data || []);
//     } catch (error) {
//       console.error('Error fetching media insights:', error);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('instagram_token');
//     setIsLoggedIn(false);
//     setUserData(null);
//     setMediaData([]);
//   };

  // return (
  //   <main className="min-h-screen bg-gray-100">
  //     <div className="container mx-auto p-8">
  //       {!isLoggedIn ? (
  //         <div className="flex justify-center items-center h-96">
  //           <button 
  //             onClick={loginWithInstagram}
  //             className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg text-lg font-medium hover:opacity-90 transition-opacity"
  //           >
  //             Login with Instagram
  //           </button>
  //         </div>
  //       ) : (
          // <div className="space-y-8">
          //   <div className="flex justify-end">
          //     <button
          //       onClick={handleLogout}
          //       className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          //     >
          //       Logout
          //     </button>
          //   </div>
          //   {userData && (
          //     <div className="bg-white p-6 rounded-lg shadow-lg">
          //       <div className="flex items-center gap-6">
          //         <img 
          //           src={userData.profile_picture_url} 
          //           alt={userData.username} 
          //           className="w-24 h-24 rounded-full"
          //         />
          //         <div>
          //           <h2 className="text-2xl font-bold mb-2">@{userData.username}</h2>
          //           <div className="grid grid-cols-3 gap-6">
          //             <div>
          //               <p className="text-gray-600">Followers</p>
          //               <p className="text-xl font-bold">{userData.followers_count}</p>
          //             </div>
          //             <div>
          //               <p className="text-gray-600">Following</p>
          //               <p className="text-xl font-bold">{userData.follows_count}</p>
          //             </div>
          //             <div>
          //               <p className="text-gray-600">Posts</p>
          //               <p className="text-xl font-bold">{userData.media_count}</p>
          //             </div>
          //           </div>
          //         </div>
          //       </div>
          //     </div>
          //   )}
            
          //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          //     {mediaData.map((media) => (
          //       <div key={media.id} className="bg-white p-6 rounded-lg shadow-lg">
          //         {media.media_type === 'IMAGE' && media.media_url && (
          //           <img 
          //             src={media.media_url} 
          //             alt={media.caption || 'Instagram post'} 
          //             className="w-full h-48 object-cover rounded-lg mb-4"
          //           />
          //         )}
          //         <p className="font-medium text-gray-800 mb-4 line-clamp-2">
          //           {media.caption || 'No caption'}
          //         </p>
          //         <div className="grid grid-cols-2 gap-4">
          //           <div>
          //             <p className="text-gray-600">Likes</p>
          //             <p className="text-xl font-bold">{media.like_count || 0}</p>
          //           </div>
          //           <div>
          //             <p className="text-gray-600">Comments</p>
          //             <p className="text-xl font-bold">{media.comments_count || 0}</p>
          //           </div>
          //           {media.insights && (
          //             <>
          //               <div>
          //                 <p className="text-gray-600">Impressions</p>
          //                 <p className="text-xl font-bold">
          //                   {media.insights.data?.[0]?.values?.[0]?.value || 0}
          //                 </p>
          //               </div>
          //               <div>
          //                 <p className="text-gray-600">Reach</p>
          //                 <p className="text-xl font-bold">
          //                   {media.insights.data?.[1]?.values?.[0]?.value || 0}
          //                 </p>
          //               </div>
          //             </>
          //           )}
          //         </div>
          //       </div>
          //     ))}
          //   </div>
          // </div>
//         )}
//       </div>
//     </main>
//   );
// }

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2,
  Shield,
  ChevronDown,
  LineChart,
  ArrowRight,
  Activity,
  Instagram,
  TrendingUp,
  BarChart2
} from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  account_type: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
  profile_picture_url: string;
}

interface MediaItem {
    id: string;
    caption?: string;
    media_type: string;
    media_url?: string;
    like_count: number;
    comments_count: number;
    insights?: {
      data: Array<{
        values: Array<{
          value: number;
        }>;
      }>;
    };
  }

const FloatingMetric = ({ title, value, delay, className }: any) => (
  <div className={`relative ${className}`}>
    <motion.div
      className="px-4 py-3 bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="text-sm text-gray-400 font-mono">{title}</div>
      <div className="text-2xl font-mono">{value}</div>
    </motion.div>
    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-xl blur-xl" />
  </div>
);

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [mediaData, setMediaData] = useState<MediaItem[]>([]);
    const INSTAGRAM_APP_ID = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
    const REDIRECT_URI = 'https://localhost:3001';

  const loginWithInstagram = () => {
    const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=1135956088244248&redirect_uri=https://localhost:3001/&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish`;
    window.location.href = authUrl;
  };

  useEffect(() => {
        const savedToken = localStorage.getItem('instagram_token');
        if (savedToken) {
          setIsLoggedIn(true);
          fetchUserData(savedToken);
        } else {
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          if (code) {
            exchangeCodeForToken(code);
          }
        }
      }, []);
    
      const exchangeCodeForToken = async (code: string) => {
        try {
          const response = await fetch('/api/auth/instagram', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              code,
              redirect_uri: REDIRECT_URI
            })
          });
          
          const data = await response.json();
          
          if (data.access_token) {
            const longLivedToken = await getLongLivedToken(data.access_token);
            localStorage.setItem('instagram_token', longLivedToken);
            setIsLoggedIn(true);
            fetchUserData(longLivedToken);
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            console.error('No access token received:', data);
            localStorage.removeItem('instagram_token');
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error('Error exchanging code for token:', error);
          localStorage.removeItem('instagram_token');
          setIsLoggedIn(false);
        }
      };
    
      const getLongLivedToken = async (shortLivedToken: string) => {
        try {
          const response = await fetch('/api/auth/instagram/long-lived', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access_token: shortLivedToken })
          });
          const data = await response.json();
          return data.access_token || shortLivedToken;
        } catch (error) {
          console.error('Error getting long-lived token:', error);
          return shortLivedToken;
        }
      };
    
      const fetchUserData = async (accessToken: string) => {
        try {
          const response = await fetch(
            `https://graph.instagram.com/me?fields=id,username,account_type,profile_picture_url,followers_count,follows_count,media_count&access_token=${accessToken}`
          );
          const data = await response.json();
          
          if (data.error) {
            console.error('Instagram API error:', data.error);
            localStorage.removeItem('instagram_token');
            setIsLoggedIn(false);
            return;
          }
          
          setUserData(data);
          if (data.id) {
            fetchMediaInsights(data.id, accessToken);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('instagram_token');
          setIsLoggedIn(false);
        }
      };
    
      const fetchMediaInsights = async (userId: string, accessToken: string) => {
        try {
          const response = await fetch(
            `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,insights.metric(impressions,reach)&access_token=${accessToken}`
          );
          const data = await response.json();
          setMediaData(data.data || []);
        } catch (error) {
          console.error('Error fetching media insights:', error);
        }
      };
    
      const handleLogout = () => {
        localStorage.removeItem('instagram_token');
        setIsLoggedIn(false);
        setUserData(null);
        setMediaData([]);
      };

  const metrics = [
    { title: "Growth Rate", value: "98.2%", x: "15%", y: "15%" },
    { title: "Engagement", value: "19.2", x: "80%", y: "25%" },
    { title: "Success Rate", value: "24/7", x: "20%", y: "75%" },
    { title: "Reach", value: "2.4M", x: "75%", y: "70%" },
  ];

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden relative">
      {!isLoggedIn ? (
        <div className="relative h-screen">
          {/* Enhanced gradient backgrounds with persistent visibility */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.1),transparent_50%)]" />
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,17,20,0.92),rgba(0,0,0,0.98))]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            />
          </div>

          {/* Additional floating gradients */}
          <motion.div
            className="absolute left-1/4 top-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              opacity: [0.2, 0.3, 0.2],
              x: [-10, 10, -10],
              y: [-10, 10, -10],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div
            className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              opacity: [0.2, 0.3, 0.2],
              x: [10, -10, 10],
              y: [10, -10, 10],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3.5
            }}
          />

          {/* Curved lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(168, 85, 247, 0.2)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            {/* Multiple sets of curved lines around content */}
            {[...Array(6)].map((_, i) => (
              <g key={i} filter="url(#glow)">
                <motion.path
                  d={`M${150 + i * 150},${150 + i * 30} C${300 + i * 80},${200 + i * 20} ${500 + i * 40},${150 + i * 25} ${700 + i * 20},${200 + i * 30}`}
                  stroke="url(#lineGradient)"
                  strokeWidth="1.5"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: [0.1, 0.3, 0.1] 
                  }}
                  transition={{
                    pathLength: { duration: 3, delay: i * 0.5 },
                    opacity: { duration: 4, repeat: Infinity, delay: i * 0.5 }
                  }}
                />
              </g>
            ))}
          </svg>

          {/* Content */}
          <div className="relative h-full flex flex-col justify-center items-center">
            {/* Floating metrics */}
            <AnimatePresence>
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.title}
                  className="absolute"
                  style={{ left: metric.x, top: metric.y }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.2 }}
                >
                  <FloatingMetric
                    title={metric.title}
                    value={metric.value}
                    delay={0.5 + index * 0.2}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Main content */}
            <div className="container mx-auto px-6 text-center z-10">
              {/* AI Platform badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gray-800/40 backdrop-blur-md border border-gray-700/50 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300 font-mono">AI-Powered Analytics Platform</span>
              </motion.div>

              {/* Main heading */}
              <motion.h1
                className="text-7xl font-light mb-8 leading-tight max-w-5xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                One-click for
                <span className="bg-gradient-to-r from-gray-100 via-purple-100 to-gray-100 bg-clip-text text-transparent"> Social Intelligence</span>
              </motion.h1>

              {/* Description text */}
              <motion.p
                className="text-gray-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Dive into your content analytics, where innovative AI technology 
                meets social media expertise for unparalleled insights
              </motion.p>

              {/* Enhanced Connect Instagram button */}
              <motion.div
                className="flex justify-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  onClick={loginWithInstagram}
                  className="group relative px-8 py-4 rounded-xl overflow-hidden transition-all duration-300"
                >
                  {/* Button background gradients */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-blue-600/80 opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300" />
                  
                  {/* Glass effect */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Button content */}
                  <div className="relative flex items-center gap-3 text-lg font-medium">
                    <Instagram className="w-5 h-5" />
                    <span>Connect Instagram</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </button>

                <button className="px-8 py-4 border border-gray-800 rounded-xl hover:bg-gray-800/30 transition-colors duration-300">
                  Discover More
                </button>
              </motion.div>

              {/* Stats row */}
              <motion.div
                className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-16 text-gray-400 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" />
                  <span>24K+ Posts Analyzed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>98% Accuracy Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>2.4x Growth Rate</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-8">
          <div className="space-y-8">
            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
            {userData && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-6">
                  <img 
                    src={userData.profile_picture_url} 
                    alt={userData.username} 
                    className="w-24 h-24 rounded-full"
                  />
                  <div>
                    <h2 className="text-2xl font-bold mb-2">@{userData.username}</h2>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-gray-600">Followers</p>
                        <p className="text-xl font-bold">{userData.followers_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Following</p>
                        <p className="text-xl font-bold">{userData.follows_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Posts</p>
                        <p className="text-xl font-bold">{userData.media_count}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaData.map((media) => (
                <div key={media.id} className="bg-white p-6 rounded-lg shadow-lg">
                  {media.media_type === 'IMAGE' && media.media_url && (
                    <img 
                      src={media.media_url} 
                      alt={media.caption || 'Instagram post'} 
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <p className="font-medium text-gray-800 mb-4 line-clamp-2">
                    {media.caption || 'No caption'}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Likes</p>
                      <p className="text-xl font-bold">{media.like_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Comments</p>
                      <p className="text-xl font-bold">{media.comments_count || 0}</p>
                    </div>
                    {media.insights && (
                      <>
                        <div>
                          <p className="text-gray-600">Impressions</p>
                          <p className="text-xl font-bold">
                            {media.insights.data?.[0]?.values?.[0]?.value || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Reach</p>
                          <p className="text-xl font-bold">
                            {media.insights.data?.[1]?.values?.[0]?.value || 0}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}