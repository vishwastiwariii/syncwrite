import { useCallback, useEffect, useRef, useState } from "react"

const GSI_SRC = "https://accounts.google.com/gsi/client"
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Load the Google Identity Services script exactly once, no matter how many
// components mount. Every caller shares the same promise.
let scriptPromise = null
function loadGsiScript() {
    if (scriptPromise) return scriptPromise
    scriptPromise = new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) return resolve()
        const s = document.createElement("script")
        s.src = GSI_SRC
        s.async = true
        s.defer = true
        s.onload = () => resolve()
        s.onerror = () => reject(new Error("Failed to load Google Identity Services"))
        document.head.appendChild(s)
    })
    return scriptPromise
}

/**
 * Wires up Google Identity Services for the ID-token (sign-in) flow.
 *
 * @param {(credential: string) => void} onCredential  called with the returned
 *        ID token (JWT) after a successful Google sign-in.
 * @returns { configured, ready, error, renderButton }
 */
export function useGoogleSignIn(onCredential) {
    const [ready, setReady] = useState(false)
    const [error, setError] = useState("")

    // Keep the latest callback without re-initializing GIS on every render.
    const callbackRef = useRef(onCredential)
    useEffect(() => {
        callbackRef.current = onCredential
    }, [onCredential])

    useEffect(() => {
        if (!CLIENT_ID) return
        let cancelled = false

        loadGsiScript()
            .then(() => {
                if (cancelled) return
                window.google.accounts.id.initialize({
                    client_id: CLIENT_ID,
                    callback: (resp) => callbackRef.current?.(resp.credential),
                })
                setReady(true)
            })
            .catch(() => {
                if (!cancelled) setError("Could not load Google sign-in")
            })

        return () => { cancelled = true }
    }, [])

    // Paint Google's official Identity Services button into `el`. GIS owns the
    // click, popup, branding, and accessibility — the supported way to start
    // the ID-token flow.
    const renderButton = useCallback((el, options = {}) => {
        if (!el || !window.google?.accounts?.id) return
        el.innerHTML = ""
        window.google.accounts.id.renderButton(el, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            logo_alignment: "center",
            ...options,
        })
    }, [])

    return { configured: !!CLIENT_ID, ready, error, renderButton }
}
