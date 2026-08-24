package com.apmusic.app;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebSettings;

import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebSettings settings = getBridge().getWebView().getSettings();
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setJavaScriptEnabled(true);
    }

    @Override
    public void onPause() {
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
        stopService(new Intent(this, BackgroundPlaybackService.class));
    }

    @Override
    public void onDestroy() {
        stopService(new Intent(this, BackgroundPlaybackService.class));
        super.onDestroy();
    }
}
