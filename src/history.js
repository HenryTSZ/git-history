import React, { useEffect, useState } from "react";
import Swipeable from "react-swipeable";
import Slide from "./slide";
import "./comment-box.css";

function CommitInfo({ commit, move, onClick }) {
  const message = commit.message.split("\n")[0].slice(0, 80);
  const isActive = Math.abs(move) < 0.5;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        transform: `translateX(-50%) translateX(${250 * move}px)`,
        transition: "transform 0.3s ease",
        opacity: 1 / (1 + Math.min(0.8, Math.abs(move))),
        zIndex: !isActive && 2
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: "5px 0 15px"
        }}
        onClick={onClick}
      >
        {commit.author.avatar && (
          <img
            src={commit.author.avatar}
            alt={commit.author.login}
            height={40}
            width={40}
            style={{ borderRadius: "4px" }}
          />
        )}
        <div style={{ paddingLeft: "6px" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: "500" }}>
            {commit.author.login}
          </div>
          <div style={{ fontSize: "0.85rem", opacity: "0.9" }}>
            {isActive && commit.commitUrl ? (
              <a
                href={commit.commitUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                on {commit.date.toDateString()}
              </a>
            ) : (
              `on ${commit.date.toDateString()}`
            )}
          </div>
        </div>
      </div>
      {isActive && (
        <div
          className="comment-box"
          title={commit.message}
          style={{ opacity: 1 - 2 * Math.abs(move) }}
        >
          {message}
          {message !== commit.message ? " ..." : ""}
        </div>
      )}
    </div>
  );
}

function CommitList({ commits, currentIndex, selectCommit }) {
  const [isScrolling, setIsScrolling] = useState(false);

  const mouseWheelEvent = e => {
    if (isScrolling) return;
    setIsScrolling(true);
    const move = e.deltaX + e.deltaY;
    if (move > 0) {
      selectCommit(currentIndex - 1);
    } else if (move < 0) {
      selectCommit(currentIndex + 1);
    }
    setTimeout(() => {
      setIsScrolling(false);
    }, 300);
  };

  return (
    <div
      onWheel={mouseWheelEvent}
      style={{
        overflow: "hidden",
        width: "100%",
        height: "100px",
        position: "fixed",
        top: 0,
        background: "rgb(1, 22, 39)",
        zIndex: 1
      }}
    >
      {commits.map((commit, commitIndex) => (
        <CommitInfo
          commit={commit}
          move={currentIndex - commitIndex}
          key={commitIndex}
          onClick={() => selectCommit(commitIndex)}
        />
      ))}
    </div>
  );
}

export default function History({ versions, loadMore }) {
  return <Slides versions={versions} loadMore={loadMore} />;
}

function Slides({ versions, loadMore }) {
  const [target, setTarget] = useState(0);

  const commits = versions.map(v => v.commit);
  const setClampedTarget = newTarget => {
    setTarget(Math.min(commits.length - 1, Math.max(0, newTarget)));
    if (newTarget >= commits.length - 5) {
      loadMore();
    }
  };
  const index = target;
  const nextSlide = () => setClampedTarget(target - 1);
  const prevSlide = () => setClampedTarget(target + 1);
  useEffect(() => {
    document.body.onkeydown = function(e) {
      if (e.keyCode === 39) {
        nextSlide();
      } else if (e.keyCode === 37) {
        prevSlide();
      }
    };
  });

  return (
    <React.Fragment>
      <CommitList
        commits={commits}
        currentIndex={target}
        selectCommit={index => setClampedTarget(index)}
      />
      <Swipeable
        onSwipedLeft={nextSlide}
        onSwipedRight={prevSlide}
        style={{ height: "100%" }}
      >
        <Slide version={versions[index]} />
      </Swipeable>
    </React.Fragment>
  );
}
