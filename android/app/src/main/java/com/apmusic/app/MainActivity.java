package com.apmusic.app;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private final Handler lifecycleHandler = new Handler(Looper.getMainLooper());
    private boolean wasPlayingBeforeBackground = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebSettings settings = getBridge().getWebView().getSettings();
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setJavaScriptEnabled(true);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getBridge().getWebView().setRendererPriorityPolicy(
                WebView.RENDERER_PRIORITY_IMPORTANT,
                false
            );
        }
    }

    @Override
    public void onPause() {
        WebView webView = getBridge().getWebView();
        webView.evaluateJavascript(
            "(() => { const p = window.__APMUSIC_YT_PLAYER__; " +
            "return !!(p && typeof p.getPlayerState === 'function' && " +
            "window.YT && p.getPlayerState() === window.YT.PlayerState.PLAYING); })()",
            value -> {
                wasPlayingBeforeBackground = "true".equals(value);
                if (!wasPlayingBeforeBackground || isChangingConfigurations()) return;

                // Keep the WebView renderer and its media pipeline active while
                // Android has moved the activity out of the foreground.
                webView.onResume();
                webView.resumeTimers();
                lifecycleHandler.postDelayed(() -> webView.evaluateJavascript(
                    "(() => { const p = window.__APMUSIC_YT_PLAYER__; " +
                    "if (p && typeof p.playVideo === 'function') p.playVideo(); })()",
                    null
                ), 250L);
            }
        );

        // Start before the activity fully leaves the foreground so Android keeps
        // the WebView process important while the official YouTube player plays.
        ContextCompat.startForegroundService(
            this,
            new Intent(this, BackgroundPlaybackService.class)
        );
        super.onPause();
    }


    @Override
    public void onResume() {
        super.onResume();
        lifecycleHandler.removeCallbacksAndMessages(null);
        stopService(new Intent(this, BackgroundPlaybackService.class));
    }

    @Override
    public void onDestroy() {
        lifecycleHandler.removeCallbacksAndMessages(null);
        stopService(new Intent(this, BackgroundPlaybackService.class));
        super.onDestroy();
    }
}
