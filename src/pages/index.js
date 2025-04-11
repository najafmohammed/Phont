import subtitles from "../data/subtitles.json";
import { useEffect, useState } from "react";

export default function Home() {
  const [subtitleData, setSubtitleData] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [autoAnimations, setautoAnimations] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setSubtitleData(subtitles);
    setDuration(
      subtitles.reduce(
        (maxTime, subtitle) => Math.max(maxTime, subtitle.end_time),
        0
      )
    );
  }, []);
  // Trigger animation whenever subtitle changes
  useEffect(() => {
    setIsAnimating(true); // Trigger the animation on text change
  }, [currentSubtitle]);

  // Function to update subtitle when the current time changes
  useEffect(() => {
    const currentSubtitle = subtitleData.find(
      (subtitle) =>
        currentTime >= subtitle.start_time && currentTime <= subtitle.end_time
    );
    if (currentSubtitle) {
      setCurrentSubtitle(currentSubtitle.subtitle);
    }
  }, [currentTime, subtitleData]);

  // Update current time while playing
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) => {
          let newTime = prevTime + 0.1; // Increment time

          if (newTime >= duration) {
            newTime = 0; // Reset to start when it reaches the end
            setIsPlaying(false); // Pause when the video ends
            setCurrentSubtitle("");
          }

          return newTime;
        });
      }, 100); // Update every 100ms
    } else if (!isPlaying && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration]);

  const resetAnimation = () => {
    setIsAnimating(false); // Reset the animation state when animation ends
  };
  // Function to handle clicking on the timeline
  const handleTimelineClick = (e) => {
    // Get the bounding rectangle of the timeline container
    const timelineRect = e.target.getBoundingClientRect();

    // Calculate the click position relative to the timeline container
    const clickPosition = e.clientX - timelineRect.left;

    // Calculate the time based on the click position
    const newTime = (clickPosition / timelineRect.width) * duration;

    setCurrentTime(newTime);
  };

  // Function to handle subtitle click from the floating window
  const handleSubtitleClick = (startTime) => {
    setCurrentTime(startTime);
  };

  // Handle Play/Pause toggle
  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  // Handle Back and Forward Buttons
  const handleBack = () => {
    setCurrentTime((prev) => Math.max(0, prev - 5)); // Go 5 seconds back
  };

  const handleForward = () => {
    setCurrentTime((prev) => Math.min(duration, prev + 5)); // Go 5 seconds forward
  };

  return (
    <div className="min-h-screen bg-black text-white grid grid-cols-[1fr_4fr]">
      {/* Sidebar */}
      <div className="flex flex-col items-center py-6 gap-4 bg-neutral-900 rounded-r-lg">
        <div className="text-2xl font-bold tracking-wide">PHONT</div>
        <hr className="border-white border w-full" />
        <div className="h-auto max-h-[80vh] overflow-auto rounded-md shadow-lg p-2 no-scrollbar">
          <div className="text-white text-sm font mb-2">Subtitles</div>
          <div className="space-y-2">
            {subtitleData.map((subtitle, index) => (
              <button
                key={index}
                className={`w-full text-left p-2 text-sm text-white border-b border-white/20 hover:bg-gray-700 ${
                  subtitle.subtitle === currentSubtitle ? "bg-gray-700" : ""
                }`}
                onClick={() => handleSubtitleClick(subtitle.start_time)}
              >
                {subtitle.subtitle}
                <div className="text-xs text-gray-400 ml-2 flex justify-between">
                  <div>{subtitle.start_time.toFixed(2)}</div>
                  <div>{subtitle.end_time.toFixed(2)} </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-4 p-6">
        {/* Top right Export button */}
        <div className="flex justify-end">
          <button className="border h-12 border-white rounded-full px-4 text-sm hover:bg-white hover:text-black transition">
            EXPORT →
          </button>
        </div>

        {/* Phone preview */}
        <div className="flex justify-center items-center">
          <div className="h-72 w-32 bg-gradient-to-t from-purple-500 to-purple-300 rounded-lg" />
        </div>

        {/* Playback controls */}
        <div className="flex justify-center items-center">
          <div>
            <button
              className="prev rounded-full border border-white w-10 h-10"
              onClick={handleBack}
            >
              &#8249; {/* Back button */}
            </button>
            <button
              className="border border-white px-4 py-2 rounded-full hover:bg-gray-700"
              onClick={handlePlayPause}
            >
              {isPlaying ? "⏸️" : "▶️"} {/* Play/Pause */}
            </button>
            <button
              className="next rounded-full border border-white w-10 h-10"
              onClick={handleForward}
            >
              &#8250; {/* Forward button */}
            </button>
          </div>
        </div>

        {/* Subtitle text */}
        <div className="flex justify-center text-2xl font-light h-12">
          {/* Subtitle Display with Animation */}
          <div
            className={`${
              isAnimating && autoAnimations ? "animate-reveal" : ""
            }`}
            onAnimationEnd={resetAnimation}
          >
            {currentSubtitle}
          </div>
        </div>

        {/* Timeline container */}
        <div className="bg-neutral-900 rounded-lg p-4">
          <div
            className="relative h-20 bg-gradient-to-t from-purple-700 to-purple-500 rounded-md overflow-hidden hover:cursor-pointer"
            onClick={handleTimelineClick}
          >
            {/* Subtitle blocks */}
            <div className="absolute inset-0 flex">
              {subtitleData.map((subtitle, index) => {
                const subtitlePosition = (subtitle.start_time / duration) * 100;
                const subtitleWidth =
                  ((subtitle.end_time - subtitle.start_time) / duration) * 100;

                return (
                  <div
                    key={index}
                    className="bg-purple-300/50"
                    style={{
                      left: `${subtitlePosition}%`,
                      width: `${subtitleWidth}%`,
                      position: "absolute",
                      top: "0",
                      bottom: "0",
                      pointerEvents: "none", // Prevent interaction with the subtitle blocks
                    }}
                  />
                );
              })}
            </div>
            {/* Playback indicator */}
            <div
              className="absolute top-0 left-1/2 w-[2px] h-full bg-white"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="flex flex-row justify-between mb-5">
            <div>{currentTime.toFixed(2)}</div>
            <div>{duration.toFixed(2)}</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoAnimations"
              value={autoAnimations}
              onChange={() => setautoAnimations(!autoAnimations)}
              className="h-4 w-4 rounded-md border-gray-300 text-purple-500 focus:ring-purple-500"
            />
            <label htmlFor="autoAnimations" className="text-white text-sm">
              auto animations
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
