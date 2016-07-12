# train
"Train" is a completely visual programming language to teach 2-6 year olds how to code.

Programs in Train look just like a wooden toy train set. Executing a program means starting the engines and watching the trains move about the tracks. Each engine constitutes a seperate thread so a multithreaded program is just train tracks with multiple trains. Cars attached to an engine are variables/memory. Wooden blocks that rest on cars are the values of the variables. There are several sets of wooden blocks that represent the different data types in Train including numbers, colors, letters, binary, dinosaurs, and safari animals. Program control is provided by forks ("wyes") and physcial loops in the track which implement if/then and while/loop logic. Stations in Train allow wooden blocks to be operated on including adding a value to memory (adding a block to a car), freeing memory (removing a block from a car), incrementing, decrementing, addition, subtraction, multiplication, and division. Wyes include greater than, less than, lazy, sprung, prompt, and random. Slingshot and catapult station remove blocks from cars and place them on the ground as a form of output. Programs are created in Train by simply drawing them on the screen--drawing tracks and wyes and placing engines, cars, cargo, and stations.

The train editor/interpretor is written in Javascript. The graphics are all rendered using Blender. All code is open source under a BSD license.

Train is being developed in the same spirit as Scratch from MIT but targeting a younger age group. The goal is to teach kids coding concepts as well as numbers, colors, math, and logic in the course of playing. Kids do not need to know how to read in order to program Train unlike other "visual" programming languages. Train simplifies and merges many concepts from other programming languages--for example in other programming languages source code, compiled code, memory, and output are all different things that together define a programs state whereas in Train the train track is everything (code, memory, output) so program state is simply the current physical location of all the tracks, stations, engines, cars, and blocks.

My goal is to have a group of coders develop Train in an open source, community fashion to create a both web and app (iOS and Android) version of Train. These will let users play with and learn Train by completing a series of levels. Users can also develop their own programs (called TrainTracks) and share them with the community via a website. If you are intereested in contributing please let me know.

Files:
train.js- contains all of the logic of the editor/interpretor
index.html- simply displays a javascript panel for train.js
img/ - contains the rendered images used for animating Train as well as the Blender source files.

