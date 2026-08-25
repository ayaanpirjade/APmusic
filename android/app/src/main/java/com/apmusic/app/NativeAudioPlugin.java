package com.apmusic.app;

import android.content.Intent;

import androidx.core.content.ContextCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NativeAudio")
public class NativeAudioPlugin extends Plugin {
    private void startAction(String action, PluginCall call) {
        Intent intent = new Intent(getContext(), NativeAudioService.class)
            .setAction(action);

        if (call != null) {
            String url = call.getString("url", "");
            String title = call.getString("title", "APMUSIC");
            String artist = call.getString("artist", "");
            String album = call.getString("album", "APMUSIC");
            String artwork = call.getString("artwork", "");
            double position = call.getDouble("position", 0.0);
            if (!url.isEmpty()) intent.putExtra(NativeAudioService.EXTRA_URL, url);
            intent.putExtra(NativeAudioService.EXTRA_TITLE, title);
            intent.putExtra(NativeAudioService.EXTRA_ARTIST, artist);
            intent.putExtra(NativeAudioService.EXTRA_ALBUM, album);
            intent.putExtra(NativeAudioService.EXTRA_ARTWORK, artwork);
            intent.putExtra(NativeAudioService.EXTRA_POSITION, position);
        }

        if (NativeAudioService.ACTION_PLAY.equals(action)) {
            ContextCompat.startForegroundService(getContext(), intent);
        } else {
            getContext().startService(intent);
        }
        if (call != null) call.resolve();
    }

    @PluginMethod
    public void play(PluginCall call) {
        String url = call.getString("url", "");
        if (url.isEmpty()) {
            call.reject("A direct audio URL is required");
            return;
        }
        startAction(NativeAudioService.ACTION_PLAY, call);
    }

    @PluginMethod
    public void pause(PluginCall call) {
        startAction(NativeAudioService.ACTION_PAUSE, call);
    }

    @PluginMethod
    public void resume(PluginCall call) {
        startAction(NativeAudioService.ACTION_RESUME, call);
    }

    @PluginMethod
    public void seek(PluginCall call) {
        startAction(NativeAudioService.ACTION_SEEK, call);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        startAction(NativeAudioService.ACTION_STOP, call);
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        call.resolve(NativeAudioService.getStatus());
    }
}
