"use client";

import {
 createContext,
 useCallback,
 useContext,
 useEffect,
 useMemo,
 useState,
 type ReactNode,
} from "react";

export type Lang = "en" | "bn";

/**
 * Bengali translations — keys are the English UI strings themselves.
 * t(key) returns the Bengali string when lang = "bn", otherwise the key
 * (English) unchanged. Missing translations safely fall back to English.
 */
const BN: Record<string, string> = {
 /* ---------- nav ---------- */ "My Quizzes": "আমার কুইজগুলো",
 Profile: "প্রোফাইল", "Log out": "লগ আউট", "Sign in": "লগ ইন",
 Friend: "বন্ধু", "Account menu": "অ্যাকাউন্ট মেনু", "Toggle theme": "থিম পরিবর্তন", "Switch language": "ভাষা পরিবর্তন", "BondhuMeter home": "BondhuMeter হোম",

 /* ---------- page / global ---------- */ "Loading BondhuMeter…": "BondhuMeter লোড হচ্ছে…", "Google sign-in is not configured on this server yet — use email sign-in instead.": "Google লগ ইন এখনো সার্ভারে চালু হয়নি — আপাতত ইমেইল দিয়ে লগ ইন করো।", "Google sign-in failed — please try email sign-in.": "Google লগ ইন ব্যর্থ হয়েছে — ইমেইল দিয়ে চেষ্টা করো।", "Welcome! Let's find out who knows you best": "স্বাগতম! চলো দেখি কে তোমাকে সবচেয়ে ভালো চেনে", "Logged out — see you soon!": "লগ আউট হয়েছে — আবার আসিস!", "Made for besties · Knows your squad better than you do": "বেস্টিদের জন্য তৈরি · তোমার স্কোয়াডকে তোমার চেয়েও ভালো চেনে", "Create quiz": "কুইজ বানাও", "Sign in first": "আগে লগ ইন করো", "You need an account to open your dashboard, build quizzes and see results.": "ড্যাশবোর্ড, কুইজ বানানো আর ফলাফল দেখার জন্য একটা অ্যাকাউন্ট লাগবে।", "Sign in now": "এখনই লগ ইন",

 /* ---------- home ---------- */ "The ultimate friendship test": "বন্ধুত্বের সেরা পরীক্ষা", "How well do your": "তোমার বন্ধুরা তোমাকে", "friends really know you?": "সত্যিই কতটা চেনে?", "Build a playful quiz about yourself, share the link with your friends, and watch the scoreboard reveal who your true besties are — who knows your secrets, your favourites, and your quirks.": "নিজের উপর মজার একটা কুইজ বানাও, বন্ধুদের সাথে লিংক শেয়ার করো, আর স্কোরবোর্ডে দেখো কে তোমার সত্যিকারের বেস্টি — কে চেনে তোমার সিক্রেট, পছন্দ আর অভ্যাসগুলো।", "Create your quiz — it's free": "তোমার কুইজ বানাও — একদম ফ্রি", "My dashboard": "আমার ড্যাশবোর্ড", "Got a quiz code from a friend? Paste it…": "বন্ধু থেকে কুইজ কোড পেয়েছো? পেস্ট করো…", "Quiz code": "কুইজ কোড",
 Play: "খেলো", "Three steps. Zero boring forms.": "তিনটা ধাপ। কোনো বোরিং ফর্ম নেই।", "From idea to scoreboard in under two minutes.": "আইডিয়া থেকে স্কোরবোর্ড, দুই মিনিটেরও কমে।", "Create your quiz": "কুইজ বানাও", "Write poll-style questions about yourself — favourite food, crush, habits — and secretly mark the correct answers.": "নিজের সম্পর্কে পোল-স্টাইল প্রশ্ন লেখো — প্রিয় খাবার, পছন্দের মানুষ, অভ্যাস — আর সঠিক উত্তরগুলো গোপনে মার্ক করে রাখো।", "Share one link": "শেয়ার করো এক লিংক", "Send your personal quiz link to friends on Messenger, WhatsApp or Instagram. Works instantly on phone and PC.": "তোমার কুইজ লিংকটা Messenger, WhatsApp বা Instagram-এ বন্ধুদের পাঠিয়ে দাও। ফোন আর পিসি — দুটোতেই সাথে সাথে চলে।", "See the scoreboard": "স্কোরবোর্ড দেখো", "Every friend gets a fun score — and you see exactly who knows you best. Bestie level unlocked.": "প্রত্যেক বন্ধু পাবে একটা মজার স্কোর — আর তুমি দেখবে হুবহু কে তোমাকে সবচেয়ে ভালো চেনে। বেস্টি লেভেল আনলকড", "Made for sharing. Built to flex.": "শেয়ার করার জন্য বানানো। ফ্লেক্স করার জন্য তৈরি।", "Perfect on any device": "যেকোনো ডিভাইসে পারফেক্ট", "The layout adapts beautifully to phones, tablets and desktops — your friends can play from anywhere.": "লেআউট ফোন, ট্যাব আর পিসি — সবখানে সুন্দরভাবে মানিয়ে নেয় — বন্ধুরা যেখান থেকেই খেলুক, সমস্যা নেই।", "Friend leaderboard": "বন্ধুদের লিডারবোর্ড", "Scores are ranked automatically. Bragging rights go to the one who knows you best.": "স্কোর অটোমেটিক র্যাঙ্ক হয়। ফ্লেক্স করার দায়িত্ব সে-ই পাবে যে তোমাকে সবচেয়ে ভালো চেনে।", "Answers stay secret": "উত্তর থাকবে গোপন", "Correct answers are marked by you and never shown before your friends submit.": "সঠিক উত্তর তুমি মার্ক করো, আর বন্ধুরা সাবমিট করার আগে কখনো দেখা যাবে না।", "Creator insights": "ক্রিয়েটর ইনসাইট", "See every attempt, every score, and share your quiz with a single tap.": "প্রতিটা খেলা, প্রতিটা স্কোর দেখো, আর এক ট্যাপে কুইজ শেয়ার করো।", "Ready to test your squad?": "তোমার স্কোয়াডকে টেস্ট করতে রাজি?", "Your quiz link is one click away. Find out who your real ones are.": "তোমার কুইজ লিংক এক ক্লিক দূরে। জেনে নাও তোমার আসল মানুষগুলো কারা।", "Start now": "এখনই শুরু করো",

 /* ---------- home preview cards ---------- */ "What's my favourite food?": "আমার প্রিয় খাবার কোনটা?", "What is my favourite food?": "আমার প্রিয় খাবার কোনটা?", "Kacchi Biryani": "কাচ্চি বিরিয়ানি", "Who is my idol?": "আমার আইডল কে?", "Messi, always": "মেসি, সবসময়", "Am I a morning person?": "আমি কি ভোরের মানুষ?", "Definitely not!": "একদমই না!", "My go-to song?": "আমার প্রিয় গান কোনটা?", "Lofi vibes": "লোফাই ভাইবস",

 /* ---------- auth ---------- */ "Please enter your email": "ইমেইল দাও তো", "Login failed": "লগ ইন হয়নি", "Welcome, {name}!": "স্বাগতম, {name}!", "Network error — please try again": "নেটওয়ার্ক সমস্যা — আবার চেষ্টা করো",
 Back: "ফিরে যাও", "Welcome to BondhuMeter": "BondhuMeter-এ স্বাগতম", "Sign in to create quizzes about yourself and see who knows you best.": "লগ ইন করে নিজের উপর কুইজ বানাও, আর দেখো কে তোমাকে সবচেয়ে ভালো চেনে।", "Continue with Google": "Google দিয়ে চলো", "or use email": "অথবা ইমেইল ব্যবহার করো", "Google sign-in gets activated the moment": "Google লগ ইন চালু হয়ে যাবে যখনই",
 and: "আর", "are added to the server.env — for now, quick email sign-in works exactly the same way.": "সার্ভারের.env-এ যোগ করা হবে — আপাতত ইমেইল লগ ইন একদম একইভাবে কাজ করে।",
 Email: "ইমেইল", "Your name": "তোমার নাম", "(optional)": "(অপশনাল)", "e.g. Rahim": "যেমন: রাহিম", "Continue with email": "ইমেইল দিয়ে চলো", "By continuing you agree to keep it fun and friendly": "চালিয়ে গেলে তুমি রাজি — সব থাকবে মজার আর বন্ধুত্বপূর্ণ",

 /* ---------- dashboard ---------- */ "Test how well you know me!": "দেখো তুমি আমাকে কতটা চেনো!", "Quiz link copied! Now share it with your friends": "কুইজ লিংক কপি হয়েছে! এবার বন্ধুদের শেয়ার করো", "Copy this link manually": "লিংকটা নিজে কপি করো", "Quiz deleted": "কুইজ ডিলিট হয়েছে", "Could not delete quiz": "কুইজ ডিলিট করা যায়নি", "Hey {name}": "হাই {name}", "Your quizzes, scores and share links — all in one place.": "তোমার কুইজ, স্কোর আর শেয়ার লিংক — সব এক জায়গায়।", "Create new quiz": "নতুন কুইজ বানাও", "No quizzes yet": "এখনো কোনো কুইজ নেই", "Create your first quiz, mark the secret answers, and share the link to see who truly knows you.": "প্রথম কুইজটা বানাও, গোপন উত্তর মার্ক করো, আর লিংক শেয়ার করে দেখো সত্যিই কে তোমাকে চেনে।", "Create my first quiz": "আমার প্রথম কুইজ বানাই", "{n} questions": "{n}টা প্রশ্ন", "{n} plays": "{n}টা খেলা", "top {a}/{b}": "সেরা {a}/{b}", "Share link": "লিংক শেয়ার",
 Results: "ফলাফল",
 Preview: "প্রিভিউ", "Delete this quiz?": "এই কুইজ ডিলিট হবে?", "“{title}” and all its scores will be removed permanently. This cannot be undone.": "“{title}” আর এর সব স্কোর চিরতরে মুছে যাবে। এটা আর ফেরানো যাবে না।",
 Cancel: "বাতিল", "Delete forever": "চিরতরে ডিলিট",

 /* ---------- profile ---------- */ "Could not save profile": "প্রোফাইল সেভ হয়নি", "Profile saved": "প্রোফাইল সেভ হয়েছে", "Your profile": "তোমার প্রোফাইল", "Google account": "Google অ্যাকাউন্ট", "Email account": "ইমেইল অ্যাকাউন্ট", "Everything you add here — phone, Facebook, Instagram — appears on your profile card so friends can recognise and reach you after they play your quiz.": "এখানে যা যা যোগ করবে — ফোন, ফেসবুক, ইনস্টা — সব তোমার প্রোফাইল কার্ডে দেখা যাবে, যাতে বন্ধুরা কুইজ খেলার পর তোমাকে চিনতে আর খুঁজে পেতে পারে।", "Display name *": "ডিসপ্লে নেম *", "How friends see you": "বন্ধুরা যেভাবে দেখবে", "Phone number": "ফোন নম্বর", "Facebook profile link": "ফেসবুক প্রোফাইল লিংক", "Instagram profile link": "ইনস্টাগ্রাম প্রোফাইল লিংক", "Short bio": "ছোট বায়ো", "Tell the world about yourself in one line…": "এক লাইনে নিজের কথা বলো…", "Save profile": "প্রোফাইল সেভ করো",

 /* ---------- quiz builder ---------- */ "How well do you know me?": "আমাকে কতটা চেনো?", "Which one is my dream place to visit?": "আমার স্বপ্নের জায়গা কোনটা?",
 Paris: "প্যারিস",
 Maldives: "মালদ্বীপ",
 Japan: "জাপান",
 Switzerland: "সুইজারল্যান্ড", "What do I do first thing in the morning?": "সকালে উঠে আমি প্রথম কী করি?", "Check my phone": "ফোন হাতে নেই", "Brush teeth": "ব্রাশ করি",
 Exercise: "ব্যায়াম করি", "Go back to sleep": "আবার ঘুমাতে যাই", "Bestie check": "বেস্টি চেক", "Who is my favourite player?": "প্রিয় খেলোয়াড় কে?",
 Messi: "মেসি",
 Ronaldo: "রোনালদো",
 Sakib: "সাকিব",
 Neymar: "নেইমার", "What makes me angry the most?": "কোনটা দেখলে আমার সবচেয়ে রাগ হয়?", "Loud chewing": "জোরে চিবানো", "Being ignored": "অবহেলা করা", "Slow internet": "স্লো ইন্টারনেট",
 Liars: "মিথ্যেবাদী",
 Burger: "বার্গার",
 Pizza: "পিৎজা",
 Fuchka: "ফুচকা", "Template loaded — edit anything you like!": "টেমপ্লেট লোড হয়েছে — যা খুশি বদলে নাও!", "Give your quiz a catchy title!": "কুইজের একটা মজার নাম দাও!", "One of your questions is missing its text": "একটা প্রশ্নের লেখা এখনো দেওয়া হয়নি", "Could not publish quiz": "কুইজ পাবলিশ হয়নি", "Quiz published!": "কুইজ পাবলিশ হয়েছে!", "Link copied — share it everywhere!": "লিংক কপি হয়েছে — সবখানে ছড়িয়ে দাও!", "Your quiz is live!": "তোমার কুইজ এখন লাইভ!", "Send this link to your friends. Their scores will appear in your Results.": "লিংকটা বন্ধুদের পাঠিয়ে দাও। তাদের স্কোর তোমার ফলাফলে দেখা যাবে।", "Copy / Share link": "কপি / শেয়ার লিংক", "Go to dashboard": "ড্যাশবোর্ডে যাও", "Build your quiz": "কুইজ সাজাও", "Ask anything about yourself, then secretly mark the right answers. Your friends will guess — and get scored.": "নিজের সম্পর্কে যা খুশি জিজ্ঞেস করো, তারপর সঠিক উত্তর গোপনে মার্ক করো। বন্ধুরা অনুমান করবে — আর স্কোর পাবে।", "Quick start:": "কুইক স্টার্ট:", "Quiz title": "কুইজের নাম", "e.g. \"How well do you know me?\"": "যেমন: \"আমাকে কতটা চেনো? \"",
 ready: "রেডি", "in progress": "চলছে", "Remove question": "প্রশ্ন মুছে ফেলো", "Question {n}": "প্রশ্ন {n}", "e.g. What is my favourite food?": "যেমন: আমার প্রিয় খাবার কোনটা?", "Options — tap the circle to mark the": "অপশনগুলো লিখো — বৃত্তে ট্যাপ করে", "correct answer": "সঠিক উত্তর", "Option {n}": "অপশন {n}", "Remove option {n}": "অপশন {n} মুছে ফেলো", "Add option": "অপশন যোগ করো", "Add another question": "আরেকটা প্রশ্ন যোগ করো", "{n} question(s)": "{n}টা প্রশ্ন", "Publish quiz": "কুইজ পাবলিশ", "Publishing as {name} — your name shows on the quiz. You can change it in Profile.": "{name} নামে পাবলিশ হচ্ছে — কুইজে তোমার নামই দেখাবে। প্রোফাইল থেকে বদলাতে পারো।",

 /* ---------- quiz taker ---------- */ "Tell us your name so your friend knows who scored!": "নামটা লেখো, যেন বন্ধু জানে কে কত পেল!", "Submit failed": "সাবমিট হয়নি", "Quiz not found": "কুইজ খুঁজে পাওয়া যায়নি", "This link may be wrong or the quiz was deleted. Double-check the code:": "লিংকটা ভুল হতে পারে অথবা কুইজটা মুছে ফেলা হয়েছে। কোডটা মিলিয়ে নাও:", "Create your own quiz": "নিজের কুইজ বানাও", "{name} challenges you": "{name} তোমাকে চ্যালেঞ্জ করছে", "{n} questions · no time limit · be honest": "{n}টা প্রশ্ন · সময়ের সীমা নেই · সত্যি বলো", "{n} question · no time limit · be honest": "{n}টা প্রশ্ন · সময়ের সীমা নেই · সত্যি বলো", "Let's go!": "চলো শুরু করি!", "Want to make your own quiz?": "নিজের একটা কুইজ বানাতে চাও?", "{name}'s quiz": "{name}-এর কুইজ", "← Previous question": "← আগের প্রশ্ন", "All answered!": "সব উত্তর হয়ে গেছে!", "What's your name? {name} will see your score on their dashboard.": "তোমার নাম কী? {name} তাদের ড্যাশবোর্ডে তোমার স্কোর দেখবে।", "Your name…": "তোমার নাম…", "Reveal my score": "স্কোর রিভিল করো", "Edit answers": "উত্তর ঠিক করো", "{a}/{b} correct": "{a}/{b} সঠিক", "Try again": "আবার খেলো", "Make your own quiz": "নিজের কুইজ বানাও", "The answer sheet": "উত্তরপত্র", "Your answer:": "তোমার উত্তর:",
 Skipped: "স্কিপ করেছো", "Correct:": "সঠিক:",

 /* ---------- viral loop: beat banner, percentile, share score, QR, notes ---------- */
 "{player} scored {pct}% on this quiz — beat it!": "{player} এই কুইজে {pct}% পেয়েছে — টপকে যাও!",
 "{a}/{b} correct — most friends can't": "{a}/{b} সঠিক — বেশিরভাগ বন্ধুই পারে না",
 "Better than {pct}% of everyone who played": "যারা খেলেছে তাদের {pct}% এর চেয়ে ভালো",
 "You're the first to play this quiz!": "এই কুইজ খেলা তুমিই প্রথম!",
 "Rank #{n} on the leaderboard": "লিডারবোর্ডে #অবস্থান {n}",
 "Share my score": "আমার স্কোর শেয়ার করো",
 "Share your score": "স্কোর শেয়ার করো",
 "This is the card friends see when you show off your score.": "তুমি স্কোর ফ্লেক্স করলে বন্ধুরা এই কার্ডটাই দেখবে।",
 "Quiz score": "কুইজ স্কোর",
 "scored {a}/{b} on {title}": "{title}-এ {a}/{b} পেয়েছে",
 "Think you can beat that?": "পারবে এটাকে হারাতে?",
 "Most friends can't": "বেশিরভাগ বন্ধুই পারে না",
 "I scored {pct}% on {name}'s quiz — most friends fail it. Beat me if you can: {link}": "আমি {name}-এর কুইজে {pct}% পেয়েছি — বেশিরভাগ বন্ধুই ফেল করে। পারলে আমাকে হারাও: {link}",
 "I scored {pct}% — can you beat me?": "আমি {pct}% পেয়েছি — তুমি পারবে আমাকে হারাতে?",
 "Scan to play": "স্ক্যান করে খেলো",
 "Friends can scan this QR code with their phone camera and start playing instantly — perfect when you meet in person.": "বন্ধুরা ফোনের ক্যামেরা দিয়ে QR কোডটা স্ক্যান করলেই সাথে সাথে খেলা শুরু করতে পারবে — সামনাসামনি দেখা হলে দারুণ কাজে লাগে।",
 "Leave a note for {name} (optional)": "{name}-এর জন্য একটা নোট লেখো (অপশনাল)",
 "Say something funny, sweet or savage…": "মজার, মিষ্টি বা সাভেজ কিছু বলো…",
 Send: "পাঠাও",
 "They'll see it next to your score on their dashboard.": "তোমার স্কোরের পাশে এটা তাদের ড্যাশবোর্ডে দেখা যাবে।",
 "Note sent to {name}": "{name}-এর কাছে নোট পাঠানো হয়েছে",
 "Write something first": "আগে কিছু লেখো",
 "Could not send the note": "নোট পাঠানো যায়নি",

 /* ---------- score badges ---------- */ "Soulmate Level!": "সোলমেট লেভেল!", "You know them inside out. Legendary!": "তুমি তাকে ভেতর-বাইরে চেনো। কিংবদন্তি লেভেল!", "True Bestie!": "সত্যিকারের বেস্টি!", "So close to perfect. You two are bonded!": "পারফেক্টের একদম কাছে। তোমাদের বন্ধন অসাধারণ!", "Good Friend!": "ভালো বন্ধু!", "You know them well, but there's more to discover!": "বেশ ভালো চেনো, তবে জানার আরও অনেক কিছু বাকি!", "Hmm...": "হুম...", "Time to hang out more and make memories!": "আরও বেশি সময় কাটাও, আরও মেমোরি বানাও!", "Stranger Alert!": "চেনা-চিনি না!", "You barely know them. Go say hi today!": "তাকে প্রায় চেনোই না। আজই হ্যালো বলে আসো!",

 /* ---------- quiz results (creator) ---------- */ "Link copied!": "লিংক কপি হয়েছে!", "Could not load results": "ফলাফল লোড হয়নি", "Back to dashboard": "ড্যাশবোর্ডে ফিরে যাও",
 Dashboard: "ড্যাশবোর্ড", "{n} friends played": "{n} জন বন্ধু খেলেছে", "Share again": "আবার শেয়ার", "No one has played yet": "এখনো কেউ খেলেনি", "Share the link": "লিংকটা শেয়ার করো", "with your friends — their scores will show up here automatically.": "বন্ধুদের সাথে — তাদের স্কোর এখানে অটোমেটিক দেখা যাবে।", "Answer key (only you can see this)": "উত্তর চাবি (শুধু তুমি দেখতে পারবে)", "Correct answer:": "সঠিক উত্তর:",

 /* ---------- admin ---------- */ "Wrong admin password": "অ্যাডমিন পাসওয়ার্ড ভুল", "Network error": "নেটওয়ার্ক সমস্যা", "Admin access": "অ্যাডমিন এক্সেস", "Enter the admin password to open the control room.": "কন্ট্রোল রুম খুলতে অ্যাডমিন পাসওয়ার্ড দাও।", "Admin password": "অ্যাডমিন পাসওয়ার্ড", "Unlock dashboard": "ড্যাশবোর্ড আনলক", "The password is set by the site owner via the ADMIN_PASSWORD env var.": "পাসওয়ার্ডটা সাইট মালিক ADMIN_PASSWORD env দিয়ে সেট করেছে।", "Failed to load admin data": "অ্যাডমিন ডেটা লোড হয়নি",
 Deleted: "ডিলিট হয়েছে", "Delete failed": "ডিলিট হয়নি", "Admin Control Room": "অ্যাডমিন কন্ট্রোল রুম", "Every visit, user, quiz and score — full visibility.": "প্রতিটা ভিজিট, ইউজার, কুইজ আর স্কোর — সম্পূর্ণ দৃশ্যমান।",
 Refresh: "রিফ্রেশ",
 Exit: "বের হও", "Total visits": "মোট ভিজিট", "Unique visitors": "ইউনিক ভিজিটর", "Registered users": "রেজিস্টার্ড ইউজার", "Quizzes created": "তৈরি হওয়া কুইজ", "Quiz plays": "কুইজ খেলা", "Search everything — email, IP, city, quiz…": "সবকিছু খোঁজো — ইমেইল, IP, শহর, কুইজ…",
 Visitors: "ভিজিটর",
 Users: "ইউজার",
 Quizzes: "কুইজ",
 Plays: "খেলা", "Clear all visits": "সব ভিজিট মুছে দাও", "Clear the entire visitor log?": "পুরো ভিজিটর লগ মুছে যাবে?", "All visit records will be permanently removed.": "সব ভিজিট রেকর্ড চিরতরে মুছে যাবে।", "Clear everything": "সব মুছে দাও", "No visits recorded yet — share the website link and watch them appear.": "এখনো কোনো ভিজিট নেই — ওয়েবসাইটের লিংক শেয়ার করো, আর দেখো কীভাবে জমা হতে থাকে।",
 When: "কখন",
 Visitor: "ভিজিটর", "IP address": "IP অ্যাড্রেস",
 Location: "লোকেশন", "Network (ISP)": "নেটওয়ার্ক (ISP)",
 Device: "ডিভাইস",
 Page: "পেজ",
 Guest: "গেস্ট",
 Unknown: "অজানা",
 unknown: "অজানা", "Unknown network": "অজানা নেটওয়ার্ক", "My quiz": "আমার কুইজ", "No registered users yet.": "এখনো কোনো রেজিস্টার্ড ইউজার নেই।",
 Unnamed: "নাম নেই", "Delete user": "ইউজার ডিলিট", "Delete user {email}?": "{email} ইউজারকে ডিলিট করবে?", "Their account, quizzes and scores will be removed permanently.": "তার অ্যাকাউন্ট, কুইজ আর স্কোর চিরতরে মুছে যাবে।", "{n} quizzes": "{n}টা কুইজ", "{n} visits": "{n}টা ভিজিট", "last seen {v}": "সর্বশেষ দেখা {v}", "joined {t}": "জয়েন: {t}", "No quizzes created yet.": "এখনো কোনো কুইজ বানানো হয়নি।",
 Code: "কোড",
 Creator: "ক্রিয়েটর", "Qs": "প্রশ্ন",
 Created: "তৈরি", "“{title}” and all its attempts will be removed.": "“{title}” আর এর সব খেলা মুছে যাবে।",
 Delete: "ডিলিট", "No quiz plays yet.": "এখনো কোনো খেলা নেই।",
 Player: "খেলোয়াড়",
 Score: "স্কোর", "Delete visit record": "ভিজিট রেকর্ড ডিলিট", "Delete attempt": "খেলা ডিলিট", "Delete quiz": "কুইজ ডিলিট", "Visitor tracking captures IP, approximate location, ISP/network, device, browser, screen, language, timezone and the logged-in account (when the visitor signs in). Browsers do not expose the WiFi name (SSID) — the ISP/org name from the IP lookup is the closest available network identifier.": "ভিজিটর ট্র্যাকিং IP, আনুমানিক লোকেশন, ISP/নেটওয়ার্ক, ডিভাইস, ব্রাউজার, স্ক্রিন, ভাষা, টাইমজোন আর লগ-ইন করা অ্যাকাউন্ট (ভিজিটর লগ ইন করলে) সংগ্রহ করে। ব্রাউজার WiFi-এর নাম (SSID) দেয় না — IP লুকআপ থেকে পাওয়া ISP/org নামই সবচেয়ে কাছের নেটওয়ার্ক পরিচয়।",

 /* ---------- auth v2 (email + password) ---------- */ "Log in": "লগ ইন", "Sign up": "সাইন আপ", "Password": "পাসওয়ার্ড", "Your password": "তোমার পাসওয়ার্ড",  "Show password": "পাসওয়ার্ড দেখাও", "Confirm password": "পাসওয়ার্ড নিশ্চিত করো", "Type the same password again": "একই পাসওয়ার্ড আবার লেখো", "Create my account": "আমার অ্যাকাউন্ট খুলি", "Please enter a password": "পাসওয়ার্ড দাও তো", "Please enter your name (at least 2 characters)": "তোমার নাম লেখো (কমপক্ষে ২ অক্ষর)",  "Passwords do not match": "পাসওয়ার্ড দুটো মিলছে না", "Passwords match": "পাসওয়ার্ড মিলে গেছে", "Strong": "শক্ত", "Good": "ভালো", "Weak": "দুর্বল", "Too short": "অনেক ছোট", "Welcome back, {name}!": "আবার স্বাগতম, {name}!", "Account created — welcome, {name}!": "অ্যাকাউন্ট তৈরি হয়েছে — স্বাগতম, {name}!", "Create quizzes about yourself and see who knows you best.": "নিজের উপর কুইজ বানাও, আর দেখো কে তোমাকে সবচেয়ে ভালো চেনে।", "are added to the server .env — meanwhile, email + password sign-in keeps everything working.": "সার্ভারের.env-এ যোগ করা হবে — ঠিক আছে, ইমেইল + পাসওয়ার্ড দিয়ে সব কাজ করছে।", "This email is already registered — please log in instead": "এই ইমেইলে আগেই অ্যাকাউন্ট আছে — লগ ইন করো", "This email is linked to a Google account — please sign in with Google": "এই ইমেইল Google অ্যাকাউন্টের সাথে যুক্ত — Google দিয়ে লগ ইন করো", "No account found with this email — please sign up first": "এই ইমেইলে কোনো অ্যাকাউন্ট নেই — আগে সাইন আপ করো", "This email uses Google Sign-In — tap “Continue with Google”": "এই ইমেইল Google দিয়ে চলে — “Google দিয়ে চলো” বাটনে চাপো", "This account has no password set yet — please sign up to create one": "এই অ্যাকাউন্টে পাসওয়ার্ড সেট করা নেই — সাইন আপ করে একটা বানাও", "Incorrect email or password": "ইমেইল বা পাসওয়ার্ড ভুল", "Please enter your password": "পাসওয়ার্ড দাও তো",

 /* ---------- admin v2 (overview + extras) ---------- */
 Overview: "ওভারভিউ", "Auto-refresh": "অটো রিফ্রেশ", "Export CSV": "CSV ডাউনলোড", "Visits today": "আজকের ভিজিট", "Active visitors (24h)": "সক্রিয় ভিজিটর (২৪ ঘণ্টা)", "Average score": "গড় স্কোর", "Best score ever": "সেরা স্কোর", "New users (7d)": "নতুন ইউজার (৭ দিন)", "Plays today": "আজকের খেলা", "Activity — last 14 days": "অ্যাক্টিভিটি — শেষ ১৪ দিন", "Website visits and quiz plays, day by day.": "ওয়েবসাইট ভিজিট আর কুইজ খেলা — দিনের হিসাবে।",
 Visits: "ভিজিট",
 Today: "আজ", "Every bar = one day (odd days hidden on mobile)": "প্রতিটা বার = একদিন (মোবাইলে বিজোড় দিন লুকানো)",
 Browsers: "ব্রাউজার", "Top countries": "শীর্ষ দেশ", "Networks (ISP)": "নেটওয়ার্ক (ISP)", "No device data yet": "এখনো ডিভাইস ডেটা নেই", "No browser data yet": "এখনো ব্রাউজার ডেটা নেই", "No location data yet": "এখনো লোকেশন ডেটা নেই", "No network data yet": "এখনো নেটওয়ার্ক ডেটা নেই", "Share of total visits": "মোট ভিজিটের অনুপাত", "Most played quizzes": "সবচেয়ে বেশি খেলা হওয়া কুইজ", "Top 5 by number of plays.": "খেলার সংখ্যা অনুযায়ী শীর্ষ ৫।", "Live activity": "লাইভ অ্যাক্টিভিটি", "The 12 most recent events across the whole site.": "পুরো সাইটের সবচেয়ে সাম্প্রতিক ১২টা ঘটনা।", "visited from {place}": "{place} থেকে ভিজিট করেছে", "created an account ({provider})": "অ্যাকাউন্ট খুলেছে ({provider})", "published “{title}”": "“{title}” পাবলিশ করেছে", "scored {a}/{b} on “{title}”": "“{title}”-এ {a}/{b} পেয়েছে", "Last login": "সর্বশেষ লগ ইন",
 Joined: "জয়েন করেছে", "Profile details": "প্রোফাইল তথ্য", "Recent visits": "সাম্প্রতিক ভিজিট", "No visits recorded for this account.": "এই অ্যাকাউন্টের কোনো ভিজিট রেকর্ড নেই।",
 Close: "বন্ধ করো", "password set": "পাসওয়ার্ড আছে", "no password": "পাসওয়ার্ড নেই",

 /* ---------- builder v3: design + ideas ---------- */ "Design your quiz card": "কুইজ কার্ড সাজাও", "Pick an emoji and a colour — it styles your quiz and the share card friends see.": "একটা ইমোজি আর রং বাছো — এটা তোমার কুইজ আর শেয়ার কার্ডের লুক ঠিক করবে।",
 Emoji: "ইমোজি",
 Colour: "রং",
 Violet: "ভায়োলেট",
 Sunset: "সানসেট",
 Candy: "ক্যান্ডি",
 Mint: "মিন্ট",
 Forest: "ফরেস্ট",
 Gold: "গোল্ড", "Need ideas? {n} fun questions": "আইডিয়া লাগবে? {n}টা মজার প্রশ্ন", "Hide ideas": "আইডিয়া লুকাও", "Browse ideas": "আইডিয়া দেখো",
 All: "সব", "Food & Taste": "খাবার আর স্বাদ",
 Personality: "ব্যক্তিত্ব",
 Friendship: "বন্ধুত্ব", "Love & Crush": "ভালোবাসা আর ক্রাশ", "Habits & Quirks": "অভ্যাস আর চালচলন", "Random Fun": "র্যান্ডম মজা", "Surprise me": "সারপ্রাইজ দাও",
 Add: "যোগ করো", "Question added — now tap the circle next to the correct answer!": "প্রশ্ন যোগ হয়েছে — এবার সঠিক উত্তরের পাশের বৃত্তে ট্যাপ করো!", "That question is already in your quiz": "এই প্রশ্নটা তো তোমার কুইজে আগেই আছে", "3 fun questions added — mark the correct answers!": "৩টা মজার প্রশ্ন যোগ হয়েছে — সঠিক উত্তরগুলো মার্ক করো!", "Move up": "উপরে তোলো", "Move down": "নিচে নামাও", "Duplicate question": "প্রশ্ন কপি করো", "Question duplicated": "প্রশ্ন কপি হয়েছে", "{a} of {b} ready": "{b}টার মধ্যে {a}টা রেডি", "Share it everywhere": "সবখানে শেয়ার করো",

 /* ---------- quick packs ---------- */ "Foodie check": "খাদ্যরসিক চেক", "Bestie test": "বেস্টি টেস্ট", "Crush alert": "ক্রাশ অ্যালার্ট", "Total random": "একদম র্যান্ডম",

 /* ---------- question templates ---------- */ "What's my all-time favourite food?": "সবচেয়ে প্রিয় খাবার কোনটা?", "I can never say no to…": "যেটা দেখলে কখনো না বলতে পারি না…",
 Sweets: "মিষ্টি", "Cha (tea)": "চা", "Street food": "স্ট্রিট ফুড", "Fast food": "ফাস্ট ফুড", "My go-to late-night snack?": "গভীর রাতের স্ন্যাকস?", "Instant noodles": "ইনস্ট্যান্ট নুডলস",
 Chips: "চিপস", "Ice cream": "আইসক্রিম", "Leftover rice": "বাসি ভাত", "Pick my comfort food on a bad day:": "খারাপ দিনে আমার কমফোর্ট খাবার?",
 Khichuri: "খিচুড়ি", "Fried rice": "ফ্রাইড রাইস",
 Momos: "মোমো",
 Chocolate: "চকলেট", "How would my best friend describe me in ONE word?": "আমার বেস্টি এক কথায় আমাকে কীভাবে বর্ণনা করবে?",
 Crazy: "পাগল",
 Loyal: "অনুগত",
 Genius: "জিনিয়াস", "Drama queen": "নাটকবাজ", "What's my biggest fear?": "আমার সবচেয়ে বড় ভয় কোনটা?", "Losing my family": "পরিবারকে হারানো",
 Darkness: "অন্ধকার",
 Insects: "পোকামাকড়",
 Failure: "ব্যর্থ হওয়া", "I'm most productive at…": "আমি সবচেয়ে বেশি কাজ করতে পারি…", "Late night": "গভীর রাতে", "Early morning": "ভোরবেলায়",
 Never: "কখনোই না", "Last-minute panic": "শেষ মুহূর্তের টেনশনে", "When I'm angry, I usually…": "রাগ হলে আমি সাধারণত…", "Go silent": "চুপ করে যাই", "Snap quickly": "সাথে সাথে বিস্ফোরিত হই", "Cry it out": "কেঁদে ফেলি", "Make memes": "মিম বানাই", "Who knows my deepest secret?": "আমার গভীরতম সিক্রেট কে জানে?", "My bestie": "আমার বেস্টি", "My mom": "আমার মা",
 Nobody: "কেউ না", "My diary": "আমার ডায়েরি", "My idea of a perfect hangout?": "পারফেক্ট আড্ডা মানে আমার কাছে?", "Café hopping": "ক্যাফে হপিং", "Late-night walk": "গভীর রাতের হাঁটা", "Gaming all night": "সারারাত গেমিং", "Movie marathon": "সিনেমা ম্যারাথন", "How do I usually text?": "আমি সাধারণত কীভাবে টেক্সট করি?", "Long paragraphs": "লম্বা লম্বা প্যারাগ্রাফ", "One-word replies": "এক কথার উত্তর", "Only memes": "শুধু মিম", "Voice notes": "ভয়েস নোট", "What would I do first if I won the lottery?": "লটারি জিতলে আমি প্রথম কী করতাম?", "Travel the world": "দুনিয়া ঘুরতে যেতাম", "Buy a house": "বাড়ি কিনতাম", "Gift my family": "পরিবারকে উপহার দিতাম", "Sleep happily": "আনন্দে ঘুমাতাম", "My celebrity crush is…": "আমার সেলিব্রিটি ক্রাশ…", "Someone Bollywood": "কেউ বলিউড থেকে", "Someone Hollywood": "কেউ হলিউড থেকে", "Someone K-drama": "কেউ কে-ড্রামা থেকে", "I have 10 crushes": "আমার ১০টা ক্রাশ আছে", "Do I believe in love at first sight?": "এক দেখায় ভালোবাসায় আমার বিশ্বাস আছে?", "100% yes": "১০০% হ্যাঁ",
 Maybe: "হয়তো",
 Nope: "না", "Only for food": "শুধু খাবারের ক্ষেত্রে", "My ideal type is…": "আমার আইডিয়াল টাইপ…",
 Funny: "মজাদার",
 Smart: "স্মার্ট", "Kind-hearted": "দয়ালু",
 Tall: "লম্বা", "What's my relationship status?": "আমার রিলেশনশিপ স্ট্যাটাস কী?",
 Single: "সিঙ্গেল",
 Taken: "রিলেশনশিপে আছি", "It's complicated": "জটিল ব্যাপার", "Married to my phone": "ফোনের সাথে বিয়ে হয়ে গেছে", "What do I do when I'm nervous?": "অস্থির হলে আমি কী করি?", "Bite my nails": "নখ কামড়াই", "Talk too much": "অনেক কথা বলি", "Laugh randomly": "একেবারে হাসতে শুরু করি", "Go totally quiet": "একদম চুপ হয়ে যাই", "How many alarms do I need to wake up?": "ঘুম থেকে উঠতে কয়টা অ্যালার্ম লাগে?", "Just 1": "মাত্র ১টা", "Around 3": "প্রায় ৩টা", "At least 10": "কমপক্ষে ১০টা", "Nobody knows": "কেউ জানে না", "The first thing I check in the morning?": "সকালে উঠে প্রথম কী চেক করি?", "Phone notifications": "ফোনের নোটিফিকেশন", "The mirror": "আয়না", "The fridge": "ফ্রিজ", "Nothing — I sleep again": "কিছুই না — আবার ঘুমাই", "I always forget to…": "আমি সবসময় ভুলে যাই…", "Reply to texts": "রিপ্লাই দিতে", "Carry my charger": "চার্জার নিতে", "Eat on time": "সময়ে খেতে", "Where my keys are": "চাবি কোথায় রেখেছি", "If I could teleport anywhere right now…": "এই মুহূর্তে টেলিপোর্ট করতে পারলে…", "Sylhet tea gardens": "সিলেটের চা বাগানে", "Straight to my bed": "সোজা বিছানায়", "My dream superpower?": "আমার স্বপ্নের সুপারপাওয়ার?", "Read minds": "মনের কথা পড়া",
 Fly: "উড়তে পারা", "Time travel": "টাইম ট্রাভেল",
 Invisibility: "অদৃশ্য হয়ে যাওয়া", "If my life was a movie, it would be…": "আমার জীবন সিনেমা হলে হতো…", "A comedy": "একটা কমেডি", "A thriller": "একটা থ্রিলার", "A rom-com": "একটা রোমকমেডি", "A documentary about naps": "ঘুম নিয়ে ডকুমেন্টারি", "One thing I can't live without?": "যেটা ছাড়া আমি বাঁচতে পারি না?", "My phone": "আমার ফোন",
 Food: "খাবার",
 WiFi: "ওয়াইফাই",

 /* ---------- share dialog ---------- */ "Share your quiz": "তোমার কুইজ শেয়ার করো", "This is the card your friends will see when you post the link on Facebook, Instagram or WhatsApp.": "Facebook, Instagram বা WhatsApp-এ লিংক পোস্ট করলে বন্ধুরা ঠিক এই কার্ডটাই দেখবে।", "Quiz challenge": "কুইজ চ্যালেঞ্জ", "{n} questions · created by {name}": "{name}-এর বানানো {n}টা প্রশ্ন", "Think you know them? Prove it": "ভাবো তুমি তাকে চেনো? প্রমাণ করো", "Most friends fail": "বেশিরভাগ বন্ধুই ফেল করে",
 Copy: "কপি", "Caption copied — paste it on Instagram!": "ক্যাপশন কপি হয়েছে — Instagram-এ পেস্ট করো!", "Ready-made caption (great for Instagram)": "রেডি ক্যাপশন (Instagram-এর জন্য দারুণ)", "Copy caption": "ক্যাপশন কপি করো",
 More: "আরও", "Instagram tip: copy the link + caption above, then paste them in your story, bio or DM.": "Instagram টিপ: উপরের লিংক + ক্যাপশন কপি করো, তারপর স্টোরি, বায়ো বা DM-এ পেস্ট করো।", 
 /* ---------- home ---------- */ "No code yet? Try the demo quiz": "কোড নেই? ডেমো কুইজ খেলে দেখো",

  /* ---------- v3 refactor additions ---------- */
  "8+ characters with a letter and a number": "কমপক্ষে ৮ অক্ষর — একটা অক্ষর আর একটা সংখ্যা থাকতে হবে",
  "A quiz can have at most 30 questions": "একটা কুইজে সর্বোচ্চ ৩০টা প্রশ্ন রাখা যায়",
  "Password must be at least 8 characters": "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে",
  "Password needs at least one letter and one number": "পাসওয়ার্ডে অন্তত একটা অক্ষর আর একটা সংখ্যা থাকতে হবে",
  "average score": "গড় স্কোর",
  "friends tested": "বন্ধু টেস্ট হয়েছে",
  "quizzes made": "কুইজ বানানো হয়েছে",
  "avg {a}": "গড় {a}",
  "passed (50%+)": "পাস করেছে (৫০%+)",
  "Send your personal quiz link to friends on Messenger, WhatsApp or Instagram. It unfurls into a branded challenge card.": "তোমার কুইজ লিংকটা Messenger, WhatsApp বা Instagram-এ বন্ধুদের পাঠিয়ে দাও। লিংকটা খুললেই দেখা যাবে ব্র্যান্ডেড চ্যালেঞ্জ কার্ড।",
  "See every attempt, best and average scores, and share your quiz with a single tap.": "প্রতিটা খেলা, সেরা আর গড় স্কোর দেখো, আর এক ট্যাপে কুইজ শেয়ার করো।",
  "Think you know {name}? I made a quiz about myself — most friends fail! Take the challenge: {link}": "{name}-কে কি ভালো চেনো? নিজের উপর একটা কুইজ বানিয়েছি — বেশিরভাগ বন্ধুই ফেল করে! চ্যালেঞ্জ নাও {link}",
  "Devices": "ডিভাইস",
  "Quiz": "কুইজ",

  /* ---------- v4: personal stats + interesting share card + admin settings ---------- */
  "Community stats": "কমিউনিটি পরিসংখ্যান",
  "My quizzes": "আমার কুইজ",
  "Friends tested": "টেস্ট হওয়া বন্ধু",
  "Best score": "সেরা স্কোর",
  "avg {a}%": "গড় {a}%",
  "Need ideas?": "আইডিয়া লাগবে?",
  "Tap any question to add it — then mark your correct answer.": "যেকোনো প্রশ্নে ট্যাপ করে যোগ করো — তারপর নিজের সঠিক উত্তরটা মার্ক করো।",
  "Starter questions added — mark the correct answers!": "স্টার্টার প্রশ্নগুলো যোগ হয়েছে — সঠিক উত্তরগুলো মার্ক করো!",
  "A secret test by {name} — most friends fail it": "{name}-এর সিক্রেট টেস্ট — বেশিরভাগ বন্ধুই ফেল করে",
  "Think you really know {name}? I made a secret test about myself — most friends fail it. Prove you're a real one: {link}": "তুমি কি সত্যিই {name}-কে চেনো? নিজের উপর একটা সিক্রেট টেস্ট বানিয়েছি — বেশিরভাগ বন্ধুই ফেল করে। প্রমাণ করো তুমি আসল বন্ধু: {link}",
  "Need access?": "অ্যাক্সেস দরকার?",
  "Contact Admin": "অ্যাডমিনের সাথে যোগাযোগ",
  "Message the admin to get your dashboard password.": "ড্যাশবোর্ড পাসওয়ার্ড পেতে অ্যাডমিনকে মেসেজ করো।",
  "Settings": "সেটিংস",
  "Website appearance": "ওয়েবসাইটের চেহারা",
  "The whole website — buttons, highlights, share card — instantly matches your pick.": "পুরো ওয়েবসাইট — বাটন, হাইলাইট, শেয়ার কার্ড — সাথে সাথে তোমার পছন্দের রঙে বদলে যাবে।",
  "Accent theme": "রং থিম",
  "Ocean": "ওশান",
  "Emerald": "এমারেল্ড",
  "Rose": "রোজ",
  "Font": "ফন্ট",
  "Modern": "মডার্ন",
  "Rounded": "গোলগাল",
  "Elegant": "এলিগেন্ট",
  "Tech": "টেক",
  "Admin contact & share card": "অ্যাডমিন কন্টাক্ট আর শেয়ার কার্ড",
  "Admin contact link": "অ্যাডমিন কন্টাক্ট লিংক",
  "This opens when someone taps the Contact Admin button on the admin login screen. The raw link is never shown — only the button.": "অ্যাডমিন লগইন স্ক্রিনে Contact Admin বাটনে চাপলে এই লিংকটা খুলবে। লিংকটা কখনো সরাসরি দেখানো হয় না — শুধু বাটনটা দেখা যায়।",
  "Share card line": "শেয়ার কার্ডের লাইন",
  "The teaser line on the share card. Use {name} — it becomes the creator's name.": "শেয়ার কার্ডের মজার লাইনটা। {name} লিখলে সেখানে ক্রিয়েটরের নাম বসবে।",
  "Demo questions": "ডেমো প্রশ্ন",
  "The starter questions every creator sees in the quiz builder. Edit them here — changes go live instantly.": "কুইজ বানানোর সময় প্রত্যেক ক্রিয়েটর যে স্টার্টার প্রশ্নগুলো দেখে। এখান থেকে বদলাও — সাথে সাথে লাইভ হয়ে যাবে।",
  "One question per line — separate options with | like: What's my dream place? | Paris | Tokyo | Bali": "প্রতি লাইনে একটা প্রশ্ন — অপশনগুলো | দিয়ে আলাদা করো, যেমন: আমার স্বপ্নের জায়গা? | প্যারিস | টোকিও | বালি",
  "Save settings": "সেটিংস সেভ করো",
  "Settings saved": "সেটিংস সেভ হয়েছে",
  "Could not save settings": "সেটিংস সেভ হয়নি",

};

interface LangContextValue {
 lang: Lang;
 setLang: (l: Lang) => void;
 toggle: () => void;
 t: (key: string, vars?: Record<string, string | number>) => string;
 /** BCP-47 locale for toLocaleDateString / toLocaleString (undefined = system default) */
 locale: string | undefined;
}

const LangContext = createContext<LangContextValue | null>(null);

const STORAGE_KEY = "bm_lang";

export function LangProvider({ children }: { children: ReactNode }) {
 const [lang, setLangState] = useState<Lang>("en");

 // restore saved preference after mount (avoids hydration mismatch)
 useEffect(() => {
 let saved: Lang | null = null;
 try {
 const v = window.localStorage.getItem(STORAGE_KEY);
 if (v === "bn" || v === "en") saved = v;
 } catch {
 /* private mode — ignore */
 }
 if (!saved) return;
 const restored: Lang = saved;
 const id = requestAnimationFrame(() => {
 setLangState(restored);
 document.documentElement.lang = restored === "bn"? "bn" : "en";
 });
 return () => cancelAnimationFrame(id);
 }, []);

 const setLang = useCallback((l: Lang) => {
 setLangState(l);
 document.documentElement.lang = l === "bn"? "bn" : "en";
 try {
 window.localStorage.setItem(STORAGE_KEY, l);
 } catch {
 /* ignore */
 }
 }, []);

 const toggle = useCallback(
 () => setLang(lang === "en"? "bn" : "en"),
 [lang, setLang]
 );

 const t = useCallback(
 (key: string, vars?: Record<string, string | number>) => {
 let s = lang === "bn"? (BN[key]?? key) : key;
 if (vars) {
 for (const [k, v] of Object.entries(vars)) {
 s = s.split(`{${k}}`).join(String(v));
 }
 }
 return s;
 },
 [lang]
 );

 const value = useMemo<LangContextValue>(
 () => ({
 lang,
 setLang,
 toggle,
 t,
 locale: lang === "bn"? "bn-BD" : undefined,
 }),
 [lang, setLang, toggle, t]
 );

 return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
 const ctx = useContext(LangContext);
 if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
 return ctx;
}
