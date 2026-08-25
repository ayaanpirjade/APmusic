package com.apmusic.app;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String BACKGROUND_PLAYBACK_INJECTION =
        "(function(){try{" +
        "Object.defineProperty(document,'hidden',{get:function(){return false;},configurable:true});" +
        "Object.defineProperty(document,'visibilityState',{get:function(){return 'visible';},configurable:true});" +
        "Object.defineProperty(document,'webkitHidden',{get:function(){return false;},configurable:true});" +
        "Object.defineProperty(document,'webkitVisibilityState',{get:function(){return 'visible';},configurable:true});" +
        "var block=function(e){if(e){e.stopImmediatePropagation();e.stopPropagation();}return false;};" +
        "window.addEventListener('visibilitychange',block,true);" +
        "document.addEventListener('visibilitychange',block,true);" +
        "window.addEventListener('webkitvisibilitychange',block,true);" +
        "document.addEventListener('webkitvisibilitychange',block,true);" +
        "window.addEventListener('blur',block,true);" +
        "window.addEventListener('pagehide',block,true);" +
        "}catch(e){}})();";

    private static final String KEEPALIVE_INJECTION =
        "(function(){try{" +
        "Object.defineProperty(document,'hidden',{get:function(){return false;},configurable:true});" +
        "Object.defineProperty(document,'visibilityState',{get:function(){return 'visible';},configurable:true});" +
        "var iframes=document.querySelectorAll('iframe');" +
        "for(var i=0;i<iframes.length;i++){try{iframes[i].contentWindow.postMessage(JSON.stringify({event:'command',func:'playVideo',args:[]}), '*');}catch(e2){}}" +
        "if(window.YT&&window.YT.get){try{" +
        "var p=window.YT.get('youtube-audio-bridge')||window.YT.get('apmusic-youtube-player');" +
        "if(p&&p.getPlayerState&&p.getPlayerState()===2){" +
        "var store=window.__zustand_player_store__;" +
        "if(!store||store.isPlaying!==false){p.playVideo();}" +
        "}" +
        "}catch(e3){}}" +
        "}catch(e){}})();";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeAudioPlugin.class);
        super.onCreate(savedInstanceState);
        WebView webView = getBridge() == null ? null : getBridge().getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            webView.evaluateJavascript(BACKGROUND_PLAYBACK_INJECTION, null);
        }
        try {
            ContextCompat.startForegroundService(this, new Intent(this, BackgroundPlaybackService.class));
        } catch (Exception ignored) {}
    }

    private void keepWebViewMediaAlive() {
        WebView webView = getBridge() == null ? null : getBridge().getWebView();
        if (webView == null) return;
        webView.onResume();
        webView.resumeTimers();
        webView.evaluateJavascript(KEEPALIVE_INJECTION, null);
        webView.evaluateJavascript(BACKGROUND_PLAYBACK_INJECTION, null);
    }

    @Override
    public void onPause() {
        super.onPause();
        keepWebViewMediaAlive();
    }

    @Override
    public void onStop() {
        super.onStop();
        keepWebViewMediaAlive();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (!hasFocus) keepWebViewMediaAlive();
    }

    @Override
    public void onResume() {
        super.onResume();
        keepWebViewMediaAlive();
    }

    @Override
    public void onDestroy() {
        // Keep the playback service alive across Activity teardown.
        super.onDestroy();
    }
}
