package com.apmusic.app;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebSettings;

import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeAudioPlugin.class);
        super.onCreate(savedInstanceState);
        WebSettings settings = getBridge().getWebView().getSettings();
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setJavaScriptEnabled(true);
    }

    @Override
    public void onPause() {
        // Important: do not call WebView.onPause(), pauseTimers(), or inject a
        // play/pause command here. The official YouTube iframe must retain its
        // media lifecycle while Android moves the activity to the background.
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
