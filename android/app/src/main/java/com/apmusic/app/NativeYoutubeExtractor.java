package com.apmusic.app;

import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;

import org.schabi.newpipe.extractor.NewPipe;
import org.schabi.newpipe.extractor.StreamingService;
import org.schabi.newpipe.extractor.downloader.Downloader;
import org.schabi.newpipe.extractor.downloader.Request;
import org.schabi.newpipe.extractor.downloader.Response;
import org.schabi.newpipe.extractor.exceptions.ReCaptchaException;
import org.schabi.newpipe.extractor.stream.AudioStream;
import org.schabi.newpipe.extractor.stream.StreamExtractor;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import okhttp3.ConnectionSpec;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;

public final class NativeYoutubeExtractor {
    private static final Object INIT_LOCK = new Object();
    private static volatile boolean initialized = false;
    private static final OkHttpClient HTTP = new OkHttpClient.Builder()
        .connectionSpecs(List.of(ConnectionSpec.RESTRICTED_TLS))
        .followRedirects(true)
        .followSslRedirects(true)
        .build();

    private NativeYoutubeExtractor() {}

    private static void ensureInitialized() {
        if (initialized) return;
        synchronized (INIT_LOCK) {
            if (initialized) return;
            NewPipe.init(new AppDownloader());
            initialized = true;
        }
    }

    public static JSObject resolve(String youtubeId) throws Exception {
        if (youtubeId == null || !youtubeId.matches("[A-Za-z0-9_-]{11}")) {
            throw new IllegalArgumentException("Invalid YouTube ID");
        }

        ensureInitialized();
        String url = "https://www.youtube.com/watch?v=" + youtubeId;
        StreamingService service = NewPipe.getServiceByUrl(url);
        StreamExtractor extractor = service.getStreamExtractor(url);
        extractor.fetchPage();

        List<AudioStream> streams = extractor.getAudioStreams();
        if (streams == null || streams.isEmpty()) {
            throw new IOException("No device-side audio streams returned");
        }

        List<AudioStream> sorted = new ArrayList<>(streams);
        sorted.sort(Comparator
            .comparingInt(NativeYoutubeExtractor::formatPriority).reversed()
            .thenComparingInt(NativeYoutubeExtractor::bitrate).reversed());

        AudioStream selected = sorted.get(0);
        JSObject result = new JSObject();
        result.put("url", selected.getUrl());
        result.put("mimeType", selected.getFormat() == null ? "" : selected.getFormat().getMimeType());
        result.put("bitrate", bitrate(selected));
        result.put("quality", selected.getQuality() == null ? "" : selected.getQuality());
        return result;
    }

    private static int bitrate(AudioStream stream) {
        int bitrate = stream.getAverageBitrate();
        if (bitrate <= 0) bitrate = stream.getBitrate();
        return Math.max(0, bitrate);
    }

    private static int formatPriority(AudioStream stream) {
        String mime = stream.getFormat() == null ? "" : stream.getFormat().getMimeType();
        if (mime != null && mime.toLowerCase().contains("audio/mp4")) return 3;
        if (mime != null && mime.toLowerCase().contains("audio/webm")) return 2;
        return 1;
    }

    private static final class AppDownloader extends Downloader {
        private static final String USER_AGENT =
            "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 " +
            "Chrome/128.0 Mobile Safari/537.36";

        @Override
        public Response execute(@NonNull Request request) throws IOException, ReCaptchaException {
            okhttp3.Request.Builder builder = new okhttp3.Request.Builder()
                .url(request.url())
                .header("User-Agent", USER_AGENT)
                .header("Accept-Language", "en-US,en;q=0.9");

            for (Map.Entry<String, List<String>> header : request.headers().entrySet()) {
                for (String value : header.getValue()) {
                    builder.addHeader(header.getKey(), value);
                }
            }

            String method = request.httpMethod();
            byte[] data = request.dataToSend();
            RequestBody body = null;
            if (data != null && data.length > 0) {
                body = RequestBody.create(data, MediaType.parse("application/x-www-form-urlencoded"));
            }
            builder.method(method, body);

            try (okhttp3.Response response = HTTP.newCall(builder.build()).execute()) {
                ResponseBody responseBody = response.body();
                String bodyText = responseBody == null ? "" : responseBody.string();
                return new Response(
                    response.code(),
                    response.message(),
                    response.headers().toMultimap(),
                    bodyText,
                    response.request().url().toString()
                );
            }
        }
    }
}
