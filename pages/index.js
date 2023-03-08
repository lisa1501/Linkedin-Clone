import Head from 'next/head'
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { AnimatePresence } from "framer-motion";
import { useRecoilState } from "recoil";
import { modalState, modalTypeState } from "../atoms/modalAtom";

import Header from "../components/Header";
import Sidebar from '../components/Sidebar'
import Feed from '../components/Feed';
import Modal from "../components/Modal";
import { connectToDatabase } from '../util/mongodb';

export async function getServerSideProps(context) {
    // Check if the user is authenticated on the server...
    const session = await getSession(context);

    if (!session) {
        return {
            redirect: {
            permanent: false,
            destination: "/home",
            },
        };
        }

        // get posts on SSR
        const { db } = await connectToDatabase();
        const posts = await db.collection("posts")
                                .find()
                                .sort({timestamp:-1})
                                .toArray();
        return {
            props: {
                session,
                posts: posts.map((post) => ({
                    _id: post._id.toString(),
                    input: post.input,
                    photoUrl: post.photoUrl,
                    username: post.username,
                    email: post.email,
                    userImg: post.userImg,
                    createdAt: post.createdAt,
                })),
            }
        }  
    }

export default function Home({ posts }) {
    console.log(posts);
    const [modalOpen, setModalOpen] = useRecoilState(modalState);
    const [modalType, setModalType] = useRecoilState(modalTypeState);
    const router = useRouter();
    const { status } = useSession({
        required: true,
        onUnauthenticated() {
        // The user is not authenticated, handle it here.
        router.push("/home");
        },
    });
    if(status === "loading") {
        return "Loading or not authenticated..."
    }
    
    return (
        <div className='bg-[#F3F2EF]  dark:bg-black dark:text-white h-screen overflow-y-scroll md:space-y-6'>
            <Head>
                <title>Feed | LinkedIn</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />

            <main className="flex justify-center gap-x-5 px-4 sm:px-12">
                <div className="flex flex-col md:flex-row gap-5">
                    <Sidebar />
                    <Feed posts={posts}/>
                </div>
            
                <AnimatePresence>
                    {modalOpen && (
                        <Modal handleClose={() => setModalOpen(false)} type={modalType} />
                    )}
                </AnimatePresence>
            </main>

            {/* <button onClick={signOut}>
                Sign Out
            </button> */}

        </div>
    )
}

