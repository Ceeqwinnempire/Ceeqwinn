
/*
 * CEEQWINN THEATRE ENGINE
 * Demo Scene: The Emerald Envelope
 * Version: 1.0.0
 *
 * This file defines story content only.
 * Playback logic belongs in theater-engine.js.
 */

(function (global) {
  "use strict";

  const emeraldEnvelopeScene = {
    id: "emerald-envelope",

    title: "The Emerald Envelope",

    description:
      "A mysterious envelope arrives with a secret that could change everything.",

    initialState: {
      envelopeOpened: false,
      sirenaFound: false,
      playerChoice: null
    },

    beats: [
      {
        id: "opening",
        type: "narration",
        heading: "An Unexpected Arrival",
        text:
          "The afternoon sun spilled across the room. " +
          "On the table lay an emerald-green envelope, " +
          "its seal shining beneath the light.",
        next: "first-reflection"
      },

      {
        id: "first-reflection",
        type: "reflection",
        heading: "Something Is Different",
        text:
          "Lexis had seen plenty of strange things before. " +
          "But this envelope felt different. " +
          "It carried no ordinary address—only her name.",
        next: "envelope-action"
      },

      {
        id: "envelope-action",
        type: "action",
        heading: "A Choice Waiting to Happen",
        text:
          "She turned the envelope over in her hands. " +
          "The seal remained unbroken. " +
          "Somewhere beyond the room, a door clicked shut.",
        next: "mysterious-dialogue"
      },

      {
        id: "mysterious-dialogue",
        type: "dialogue",
        heading: "A Quiet Warning",
        speaker: "Unknown Voice",
        text:
          "“Whatever is inside that envelope, Lexis, " +
          "make sure you understand what it means " +
          "before you decide what to do next.”",
        next: "envelope-illustration"
      },

      {
        id: "envelope-illustration",
        type: "image",
        heading: "The Emerald Envelope",
        text:
          "The sealed envelope rests on the table, " +
          "waiting for someone to make the first move.",

        // Add an image path when a suitable illustration exists.
        // Example: media/emerald-envelope.jpg
        src: "",

        alt: "An emerald-green sealed envelope on a table",

        next: "the-sound"
      },

      {
        id: "the-sound",
        type: "audio",
        heading: "A Sound from the Hallway",
        text:
          "A faint sound came from beyond the door. " +
          "Was someone waiting for Lexis?",

        // Optional. Add a supported audio file path when available.
        src: "",

        next: "the-decision"
      },

      {
        id: "the-decision",
        type: "choice",
        heading: "What Should Lexis Do?",
        text:
          "The envelope is still sealed. " +
          "Lexis must decide how to proceed.",

        options: [
          {
            id: "open-envelope",
            label: "Open the envelope",
            text: "Break the seal and discover its contents.",

            set: {
              envelopeOpened: true,
              playerChoice: "open"
            },

            next: "open-branch"
          },

          {
            id: "find-sirena",
            label: "Keep it sealed and find Sirena",
            text:
              "Leave the envelope untouched and seek Sirena.",

            set: {
              envelopeOpened: false,
              sirenaFound: true,
              playerChoice: "sealed"
            },

            next: "sealed-branch"
          }
        ]
      },

      {
        id: "open-branch",
        type: "branch",

        routes: [
          {
            when: {
              key: "envelopeOpened",
              equals: true
            },
            next: "open-ending"
          }
        ],

        default: "invalid-choice-ending"
      },

      {
        id: "sealed-branch",
        type: "branch",

        routes: [
          {
            when: {
              all: [
                {
                  key: "envelopeOpened",
                  equals: false
                },
                {
                  key: "sirenaFound",
                  equals: true
                }
              ]
            },
            next: "sealed-ending"
          }
        ],

        default: "invalid-choice-ending"
      },

      {
        id: "open-ending",
        type: "end",
        heading: "The Secret Revealed",
        endingLabel: "ENDING ONE",
        text:
          "Lexis broke the emerald seal. Inside lay a message " +
          "that connected her family to a mystery she had " +
          "never imagined. Before she could read it twice, " +
          "footsteps approached the door.\n\n" +
          "Someone else knew about the envelope. " +
          "And they were already here."
      },

      {
        id: "sealed-ending",
        type: "end",
        heading: "The Secret Waits",
        endingLabel: "ENDING TWO",
        text:
          "Lexis left the envelope exactly where she found it " +
          "and went to find Sirena. When Sirena saw the green " +
          "seal, her expression changed.\n\n" +
          "“You haven't opened it, have you?” she asked.\n\n" +
          "Lexis shook her head. Sirena looked towards the door. " +
          "“Good. Then we still have time to find out who sent it.”"
      },

      {
        id: "invalid-choice-ending",
        type: "end",
        heading: "The Mystery Remains",
        endingLabel: "ALTERNATE ENDING",
        text:
          "Something went wrong with the decision. " +
          "The mystery remains unresolved. Restart the story " +
          "to try again."
      }
    ]
  };

  // Expose the scene for theater-app.js.
  global.CEEQWINN_DEMO_SCENE = emeraldEnvelopeScene;
})(window);
