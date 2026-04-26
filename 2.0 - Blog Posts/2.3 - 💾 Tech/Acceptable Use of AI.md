---
title: Acceptable Use of AI
author: Niall Bell
date: 2025-10-26
Type: Blog Post
publish: true
permalink: /blog/acceptable-use-of-ai
description: '*In this post I use the term AI often. Unless stated this term refers to LLMs, GPTs, and similar generative AI tools*'
excerpt: '*In this post I use the term AI often. Unless stated this term refers to LLMs, GPTs, and similar generative AI tools*'
tags:
  - ai
  - artificial-intelligence
  - critical-thinking
  - photography
heroImage: https://i.imgur.com/Ti8yODJ.jpeg
---
*In this post I use the term AI often. Unless stated this term refers to LLMs, GPTs, and similar generative AI tools*

I recently went to a talk about AI and the speaker drifted from the their topic about visual storytelling and ended up talking about how they use AI in their day to day work. I took issue with a lot of what was said and is spurred me on to think about what I consider acceptable used of AI.

I need to start by setting out my general thoughts on AI. I think AI has it's value in things other than chat bots and 'agents'. I think it can help humans achieve some things that we would otherwise struggle to achieve, such as speeding up medical diagnosis and finding novel solutions to complex problems. But agentic AI, this is where things start to get a bit murky.

## Unacceptable IMO

### An AI Is Not A Friend

The first thing I feel needs to be said is that I don't believe AI should be our friend. What I mean by this is that I don't think humans should talk to AI like we would another person. AI is a tool that can do things for us, we don't need to speak to it like we are going to offend it if we don't ask how it's doing. By treating AI tools like it is a person, we artificially inflate it's intelligence by trying to make it fit into a human shaped box. This opens us up to all sorts of exploitation.

I read a story about someone who had an "emotional relationship" with an AI chat bot only for an update to change how the AI "spoke" triggering emotional stress. Judge that as you will.

### Make Demands

Treating an AI like a tool is the best way to ensure you know it's a tool and nothing more. Instead of saying "Hey, can you find me the best Italian restaurant in town?" say "List all Italian restaurants in town with their review scores.". The difference is distinct in a few ways:

- Don't humanise the AI by greeting it. Its not necessary.
- Don't ask the AI to make a decision for you, ask it to give you the information you need to make an informed decision.

The latter version allows for the same outcome, but doesn't devolve the critical thinking and decision making to the algorithm. In my opinion, this is a correct use of AI. My only caveat here is that sites like trip advisor already do this for you, so browse when options are available. Other aggregation tasks are less easy to do on a single site and as such fall into the tedious category. For example, 'show me that average snowfall in Squamish over the past 15 years and use more than one data source for accuracy'. This would be time consuming to do manually and only a handful of paid services offer it in one place such as Windy.app.

### No Written Content

Another issue I have with AI use is when people use it to write content, i.e., a blog post, an email, or resignation letter. In doing so you are taking away your own voice and allowing an algorithm to speak for you. There is a reason you can tell I've typed every single word of this post myself, it's not perfect, and it is probably more meaningful for it.

Using AI to produce content for you reduces your voice to zero, and produces sub-par content - not acceptable.

### It's Not A Mentor

This is my main bugbear, using AI tools as mentors. The person at the talk spoke about how they use AI (specifically ChatGPT) to explore situations to help them tell the story (they are a film maker). Firstly, how did you make a living before AI? Secondly, why us an algorithm to tell a human story? What does this offer over doing it organically? I can tell you what I think it offers, it offers less work. Critical thinking and creativity are hugely taxing on our grey matter. It takes energy to think and offloading it to a machine helps us get more done with less effort. You can do the thinking on your own, our brains have evolved to be very good at it!

Not acceptable.

### Replacing Internet Browsing

Initially, I was in camp "this is ok" but now I'm not. Energy used to be a concern but recent studies show it might not be as bad as we think. The bigger issue here is that you are no longer using the internet how it was designed. Stick with me.

If you ask ChatGPT for a recipe for pizza dough, you will get one and you can go make pizza and think nothing more of it. But where did that recipe come from? Well the LLM was trained on thousands of pizza recipes from food blogging websites. These bloggers write recipes and share them online so that we can make delicious food. When we visit their site, they show us a few ads (usually) and get paid as a result. An LLM Scraper Bot can visit that site once and display the recipe a billion times. The blogger doesn't get a penny. You can see where this is going. The blogger stops blogging because they have to get another job and we get less recipes to work from. The internet stagnates. 

So if you are wanting to browse for information, please browse. It keeps the internet going. 

*A note: On my main blog I have enabled tools to prevent AI scrapers accessing my content. I don't want my words being used in AI generated responses. I want people to read my words, not a vomited up version. Cloudflare is also trialling a tool where AI companies can pay users to access their content for training. I don't think this will take off given how difficult it already is to make money from selling AI products.*

## Acceptable IMO
### Boring Stuff

AI can be super useful. Once such example is dealing with boring stuff. I often take handwritten notes on my iPad because I find it to be far more natural than typing. I can scribble away far quicker than I can type, and I'm a fast typist! So I frequently throw my handwritten notes into an LLM and ask it to digitise it into markdown text so I can paste it into my digital note taking app. I can totally type the notes up, they are rarely long, but it's a bit boring. I know what you're thinking, we can use OCR for this, we don't need LLMs and you would be correct, but what you haven't considered is how dreadful my handwriting is and how bad I am at taking notes. OCR works but takes me forever to fix the errors, an LLM can do this on the fly.

This is in my opinion and acceptable use of AI.

### The Tedious Stuff

Tedious stuff is another area I think LLMs excel. My photography portfolio is a static site generated from markdown files. To add photographs to a gallery I have to actually type the code and then paste in all the links to the images, this is tedious. Here is an example of the code, I have this code block repeated for every image in a gallery:

```html
<a href="https://i.imgur.com/kTGIAGs.jpeg" data-fancybox="gallery">
        <img src="https://i.imgur.com/kTGIAGs.jpeg" width="300" height="200">
</a>
```

So what I do is copy and pasta this into and LLM along with a bunch of image links and say, create me a list of code blocks each with a unique link from the list. Within a second or two, I have the whole code block ready to drop into my gallery. To do this manually for 20 photographs might take me 10 minutes if I'm being careful not to make any syntax errors.

Another use case here is summarising audio transcripts. Typically I take notes and I think this is the best thing to do, but sometimes I want to be in the moment and to focus, so I set my audio recorder going. I will re-listen to bits but generally will have an LLM produce a summary. This is so I can archive the recording without fear of losing information. Usually I request timestamps so I can revisit the recording. This is kinda old tech now tho so I don't really consider it 'AI' in the current sense.

This is in my opinion an acceptable use of AI.

## Coding

This one is a bit more nuanced so bear with me. I can code in two languages, Python and HTML (and CSS with a bit of JS). My knowledge is good enough to get me through most problems, although I'm definitely not an expert. I can develop, build, and deploy local and web apps among other things, one of my most involved projects is this [bird data portal](https://mbc.naturesquamish.ca) which I built for a voluntary project I coordinate.

The problem is coding is finicky and tedious, especially for none experts, and this it makes it inaccessible. This was an issue back when HTML was written by hand to make websites, so we moved to WYSIWYG (what you see is what you get) editors. We made software which writes the HTML code for you. LLMs are the WYSIWYG software for all programming languages. This type of programming was recently coined 'Vibe Programming' and many software development companies are now using LLMs to generate huge percentages of their codebase.

Coding is also usually super syntax focussed. Any programmer can relate to one character typed wrong causing hours of debugging headaches. LLMs are accurate and tend not to make syntax errors. LLMs are also pretty good at deciphering weird or complex traceback errors and translating what the actual issue is. This saves lots of time when debugging. They can also help with tedious tasks like refactoring code and stuff like that.

So I think that code generation and modification is an acceptable use of AI, just like using webpage builders has been acceptable for ages. My only caveat to this one is that you should really try to learn the language too or else what you build will probably not work very well if it has any complexity. I can ask an LLM to generate a function for me, but I still have to do a fair bit of work to get it to integrate into my app. Also, human code reviews are necessary for anything production to ensure security and efficiency. 

## To Wrap Up

While tasks for AI can be further reduced down and there are a million caveats and nuances, I think this post does a good job of setting out my stall on what I think AI can do for us. I think tasks can be broadly split into three categories, two of which affect everyday users:

- Modelling, complex analysis, and rapid processing: **Acceptable**
- Boring, tedious, and finicky tasks: **Acceptable**
- Critical thinking, problem solving, and browsing: **Unacceptable**

I'm sure you can pick holes in this, and it wouldn't surprise me, this is a complex topic, but I think this is a good start for assessing where AI can fit into our lives without taking away what makes us human.

I want to add on last point, AI integration. I reject the notion that we need AI in everything. Machine learning is cool and can make life easier (photo tagging in Apple Photos is a amazing!), but I don't need my fridge to tell me what meals I can cook, or my email client to rewrite my email.

I'd be curious to know what others think on this topic, so get in touch!
