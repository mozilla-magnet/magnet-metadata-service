# (Another) Physical-Web Web Service [![Build Status](https://travis-ci.org/arcturus/pw-ws.svg?branch=master)](https://travis-ci.org/arcturus/pw-ws)

This project is an implementation in Nodejs of a [Physical-Web](https://google.github.io/physical-web/) metadata service.

It's purpose is to parse and analyze the content of the urls to provide clients with extra information.

It's based on the [first implementation of a metadata server](https://github.com/google/physical-web) made in Python, and as well it's compatible with the sample application provided by Google.

## Why another Physical Web Web Service?

The Pysical Web project is, so far,  a test for developers to let their dreams and ideas fly.

All the software created are proof of concepts to try out ideas, those new ideas can grow with new services, [implementations in different operating systems](https://github.com/gmarty/fxos-physical-web), and evolutions.

## New ideas

This implementation will follow the current metadata web service, so it's compatible with current applications.

But also adds some extra services/ideas to complement the initial idea like:

+ Parsing [Open Graph](http://ogp.me/) metadata, for allowing richer experiences in the client.
+ Widget service: for thing clients on the devices, this metadata service could output a HTML5 widget representation of the URL detected. Something similar to the Firefox OS idea of [pinned sites](https://wiki.mozilla.org/FirefoxOS/Pin_the_Web).

## Web Service end points

[Here](docs/api.md) you can find the api for this web service.
