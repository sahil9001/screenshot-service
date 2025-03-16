'use client';

import { supabase } from "@/lib/supabase";
import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { useEffect, useState } from "react";

export default function Payment() {
    const [paddle, setPaddle] = useState<Paddle>();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        initializePaddle({
            environment: 'sandbox',
            token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
        }).then(paddle => setPaddle(paddle))
    }, []);

    const handleCheckout = () => {
        if (!paddle) return alert("Paddle not initialized");
        if (!user) return alert("User not found");
        paddle.Checkout.open({
            items: [{
                priceId: "pri_01jpdcay42keaer32eyzj2b2c7",
                quantity: 1,
            }],
            customData: {
                app_user_id: user.id,
                app_user_email: user.email,
            },
            settings: {
                displayMode: 'overlay',
                theme: 'dark',
                successUrl: `http://localhost:3000/dashboard/billing?success=true`,
            }
        })
    }
    return <button onClick={() => handleCheckout()}>Subscribe</button>;
}