/*
 * CEEQWINN Theatre — Markdown Story Adapter
 * Reads CMS Markdown and converts supported story markers
 * into the beat format used by the existing Theatre Engine.
 * Vanilla JavaScript only.
 */

(function (global) {
  "use strict";

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function parseNarrativeLines(lines, prefix, counter) {
    const beats = [];
    let heading = "";
    let paragraph = [];

    function flushParagraph() {
      const text = paragraph.join(" ").trim();
      paragraph = [];

      if (text) {
        beats.push({
          id: prefix + "-" + (++counter.value),
          type: "narration",
          heading: heading || undefined,
          text: text
        });
        heading = "";
      }
    }

    lines.forEach(function (rawLine) {
      const line = rawLine.trim();

      if (
        line === "[THEATRE]" ||
        line === "[/THEATRE]" ||
        line === "---"
      ) {
        flushParagraph();
        return;
      }

      const headingMatch = line.match(/^#{1,6}\s+(.+)$/);

      if (headingMatch) {
        flushParagraph();
        heading = headingMatch[1].trim();
        return;
      }

      if (!line) {
        flushParagraph();
        return;
      }

      paragraph.push(line);
    });

    flushParagraph();

    if (heading) {
      beats.push({
        id: prefix + "-" + (++counter.value),
        type: "narration",
        heading: heading,
        text: ""
      });
    }

    return beats;
  }

  function parseMarkdown(source, requestedSlug) {
    const frontMatter = source.match(
      /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/
    );

    let title = "Untitled Story";
    let body = source;

    if (frontMatter) {
      const titleMatch = frontMatter[1].match(
        /^title:\s*(.*?)\s*$/m
      );

      if (titleMatch) {
        title = titleMatch[1]
          .replace(/^["']|["']$/g, "");
      }

      body = source.slice(frontMatter[0].length);
    }

    const lines = body.replace(/\r\n/g, "\n").split("\n");
    const segments = [];
    const counter = { value: 0 };
    let narrativeLines = [];
    let sectionNumber = 0;
    let i = 0;

    function flushNarrative() {
      if (!narrativeLines.length) return;

      const beats = parseNarrativeLines(
        narrativeLines,
        "story-" + (++sectionNumber),
        counter
      );

      if (beats.length) {
        segments.push({
          kind: "narrative",
          beats: beats
        });
      }

      narrativeLines = [];
    }

    while (i < lines.length) {
      const choiceMatch = lines[i].trim().match(
        /^\[CHOICE(?::([^\]]+))?\]$/
      );

      if (!choiceMatch) {
        narrativeLines.push(lines[i]);
        i++;
        continue;
      }

      flushNarrative();

      const choiceId = slugify(
        choiceMatch[1] || ("choice-" + (sectionNumber + 1))
      );

      i++;

      const options = [];

      while (
        i < lines.length &&
        !/^\[CONSEQUENCE:[A-Z]\]\s*$/.test(lines[i].trim())
      ) {
        const optionMatch = lines[i].trim().match(
          /^\[([A-Z])\]\s*(.+)$/
        );

        if (optionMatch) {
          options.push({
            key: optionMatch[1],
            label: optionMatch[2].trim()
          });
        }

        i++;
      }

      const branches = [];

      while (
        i < lines.length &&
        /^\[CONSEQUENCE:[A-Z]\]\s*$/.test(lines[i].trim())
      ) {
        const consequenceMatch = lines[i].trim().match(
          /^\[CONSEQUENCE:([A-Z])\]$/
        );

        const branchKey = consequenceMatch[1];
        const branchLines = [];

        i++;

        while (
          i < lines.length &&
          !/^\[ENDCHOICE\]\s*$/.test(lines[i].trim()) &&
          !/^\[CONSEQUENCE:[A-Z]\]\s*$/.test(lines[i].trim())
        ) {
          branchLines.push(lines[i]);
          i++;
        }

        if (
          i < lines.length &&
          /^\[ENDCHOICE\]\s*$/.test(lines[i].trim())
        ) {
          i++;
        }

        const branchBeats = parseNarrativeLines(
          branchLines,
          choiceId + "-" + branchKey.toLowerCase(),
          counter
        );

        if (!branchBeats.length) {
          throw new Error(
            "Choice " + choiceId +
            " has an empty consequence for option " + branchKey + "."
          );
        }

        branches.push({
          key: branchKey,
          beats: branchBeats
        });

        while (i < lines.length && !lines[i].trim()) {
          i++;
        }
      }

      if (!options.length || !branches.length) {
        throw new Error(
          "Choice " + choiceId +
          " needs options and matching consequence sections."
        );
      }

      options.forEach(function (option) {
        if (!branches.some(function (branch) {
          return branch.key === option.key;
        })) {
          throw new Error(
            "Choice " + choiceId +
            " has no consequence for option " + option.key + "."
          );
        }
      });

      segments.push({
        kind: "choice",
        id: choiceId,
        options: options,
        branches: branches
      });
    }

    flushNarrative();

    const ending = {
      id: "chapter-end",
      type: "end",
      heading: "End of Test Chapter",
      endingLabel: "TEST COMPLETE",
      text: "You have reached the end of this test chapter."
    };

    segments.push({
      kind: "narrative",
      beats: [ending]
    });

    function firstBeatId(segment) {
      if (segment.kind === "choice") return segment.id;
      return segment.beats[0].id;
    }

    const beats = [];

    segments.forEach(function (segment, index) {
      if (segment.kind === "narrative") {
        beats.push.apply(beats, segment.beats);
        return;
      }

      const followingSegment = segments[index + 1];
      const continuationId = firstBeatId(followingSegment);

      const choiceBeat = {
        id: segment.id,
        type: "choice",
        heading: "What Should Lexis Do?",
        text: "Choose what Lexis should do next.",
        options: segment.options.map(function (option) {
          const branch = segment.branches.find(function (item) {
            return item.key === option.key;
          });

          return {
            id: segment.id + "-" + option.key.toLowerCase(),
            label: option.label,
            set: {
              [segment.id]: option.key
            },
            next: branch.beats[0].id
          };
        })
      };

      beats.push(choiceBeat);

      segment.branches.forEach(function (branch) {
        branch.beats[branch.beats.length - 1].next =
          continuationId;

        beats.push.apply(beats, branch.beats);
      });
    });

    return {
      id: requestedSlug,
      title: title,
      initialState: {},
      beats: beats
    };
  }

  async function loadArticle(requestedSlug) {
    let slug = String(requestedSlug || "")
      .replace(/\.md$/i, "");

    if (!/^[a-z0-9-]+$/i.test(slug)) {
      throw new Error("The article filename is not valid.");
    }

    const url = new URL(
      "../content/articles/" + slug + ".md",
      window.location.href
    );

    const response = await fetch(url.href, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        "Could not load content/articles/" + slug +
        ".md. Check the filename and website deployment."
      );
    }

    return parseMarkdown(await response.text(), slug);
  }

  global.CEEQWINN_MARKDOWN = {
    parse: parseMarkdown,
    loadArticle: loadArticle
  };
})(window);
