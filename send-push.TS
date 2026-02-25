

import { serve }       from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush          from "https://esm.sh/web-push@3.6.7";

const SUPABASE_URL     = Deno.env.get("https://xjckbqbqxcwzcrlmuvzf.supabase.co")!;
const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC     = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE    = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_EMAIL      = Deno.env.get("kwelly1234567@gmail.com")!;

webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC, VAPID_PRIVATE);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

const CORS = {
    "Access-Control-Allow-Origin" : "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};



serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: CORS });
    }

    try {
        const { shop_id, product } = await req.json();

        if (!shop_id || !product) {
            return new Response(JSON.stringify({ error: "shop_id et product requis" }), {
                status: 400, headers: { ...CORS, "Content-Type": "application/json" }
            });
        }

        // 1. Récupérer tous les abonnés de cette boutique
        const { data: subscribers, error } = await supabase
            .from("push_subscriptions")
            .select("endpoint, p256dh, auth")
            .eq("shop_id", shop_id);

        if (error) throw error;
        if (!subscribers?.length) {
            return new Response(JSON.stringify({ sent: 0, message: "Aucun abonné" }), {
                headers: { ...CORS, "Content-Type": "application/json" }
            });
        }

        // 2. Construire la notification
        const prix = new Intl.NumberFormat("fr-FR").format(product.prix);
        const notifPayload = JSON.stringify({
            title  : `🆕 ${product.shopName}`,
            body   : `${product.nom} — ${prix} FCFA`,
            icon   : "/oda1.png",
            badge  : "/oda1.png",
            image  : product.mainImage,          // ← image du produit (grande)
            tag    : `produit-${product.id}`,
            data   : {
                url       : `/boutique.html?shop=${product.shopSlug}`,
                productId : product.id,
                shopId    : shop_id,
            },
            actions: [
                { action: "voir",     title: "👀 Voir le produit" },
                { action: "ignorer",  title: "Ignorer"             },
            ],
            vibrate         : [200, 100, 200],
            requireInteraction: false,
            renotify        : true,
        });

        // 3. Envoyer à chaque abonné
        const results = await Promise.allSettled(
            subscribers.map(sub =>
                webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys    : { p256dh: sub.p256dh, auth: sub.auth },
                    },
                    notifPayload
                )
            )
        );

        const sent   = results.filter(r => r.status === "fulfilled").length;
        const failed = results.filter(r => r.status === "rejected").length;

        // 4. Nettoyer les abonnements expirés (code 410 = endpoint mort)
        const deadEndpoints: string[] = [];
        results.forEach((r, i) => {
            if (r.status === "rejected") {
                const reason = (r as PromiseRejectedResult).reason;
                if (reason?.statusCode === 410) {
                    deadEndpoints.push(subscribers[i].endpoint);
                }
            }
        });

        if (deadEndpoints.length) {
            await supabase
                .from("push_subscriptions")
                .delete()
                .in("endpoint", deadEndpoints);
            console.log(`🧹 ${deadEndpoints.length} abonnements expirés supprimés`);
        }

        console.log(`✅ Notifications envoyées — ${sent} ok / ${failed} échecs`);
        return new Response(JSON.stringify({ sent, failed }), {
            headers: { ...CORS, "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error("❌ Erreur send-push:", err);
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500, headers: { ...CORS, "Content-Type": "application/json" }
        });
    }
});