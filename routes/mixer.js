const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ytdlp = require('yt-dlp-exec'); 
const router = express.Router();

const TMP_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

async function downloadFile(url, dest) {
  const writer = fs.createWriteStream(dest);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

router.post('/mix/export', async (req, res) => {
  /*
  Expected JSON body:
  {
    youtubeVideoId: 'abc123',
    videoStart: 10,
    videoEnd: 40,
    audioPreviewUrl: 'https://audio-preview-url.mp3',
    audioStart: 0,
    audioEnd: 30
  }
  */

  try {
    const { youtubeVideoId, videoStart, videoEnd, audioPreviewUrl, audioStart, audioEnd } = req.body;
    if (!youtubeVideoId || videoStart == null || videoEnd == null || !audioPreviewUrl || audioStart == null || audioEnd == null) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Prepare temp paths
    const videoPath = path.join(TMP_DIR, `video_${youtubeVideoId}.mp4`);
    const audioPath = path.join(TMP_DIR, `audio_preview.mp3`);
    const outputPath = path.join(TMP_DIR, `mixed_${Date.now()}.mp4`);

    // 1. Download YouTube video
    await ytdlp(`https://www.youtube.com/watch?v=${youtubeVideoId}`, {
      output: videoPath,
      format: 'bestvideo+bestaudio',
      mergeOutputFormat: 'mp4',
      noPlaylist: true,
      quiet: true,
      noWarnings: true,
    });

    // 2. Download audio preview
    await downloadFile(audioPreviewUrl, audioPath);

    // 3. Trim and merge using ffmpeg
    const videoDuration = videoEnd - videoStart;
    const audioDuration = audioEnd - audioStart;

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .setStartTime(videoStart)
        .duration(videoDuration)
        .input(audioPath)
        .setStartTime(audioStart)
        .duration(audioDuration)
        .outputOptions([
          '-c:v copy',
          '-map 0:v:0',
          '-map 1:a:0',
          '-shortest',
        ])
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });

    // 4. Stream the resulting file back to client
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename=mixed_${youtubeVideoId}.mp4`);

    const readStream = fs.createReadStream(outputPath);
    readStream.pipe(res);

    // Cleanup temp files
    res.on('finish', () => {
      [videoPath, audioPath, outputPath].forEach((file) => {
        if (fs.existsSync(file)) fs.unlink(file, () => {});
      });
    });

  } catch (err) {
    console.error('Error in /mix/export:', err);
    res.status(500).json({ error: 'Failed to create mixed video' });
  }
});

module.exports = router;
