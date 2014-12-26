#!/usr/bin/env python
# -*- coding: utf-8 -*-

# To setup dependencies for this:
# brew install python
# brew install libjpeg
# pip install pil
# git clone https://github.com/openzoom/deepzoom.py.git
# cd deepzoom.py/
# python dz-convert.py --help

import deepzoom
import glob
import os
import argparse

parser = argparse.ArgumentParser(prog='dz-convert', description='Convert images to deepzoom tiles')
parser.add_argument('input-spec', nargs='*')
parser.add_argument('--size', type=int, default=128, help='tile size in pixels')
parser.add_argument('--overlap', type=int, default=2, help='tile overlap in pixels')
parser.add_argument('--format', default='jpg', help='tile format (jpg, png)')
parser.add_argument('--quality', default='0.8', help='image quality')
parser.add_argument('--filter', default='bicubic', help='resize filter')
parser.add_argument('--output', default='./dzi', help='output folder')

args = parser.parse_args()
if len(args.inputs) == 0:
  parser.print_help()
  exit

creator = deepzoom.ImageCreator(tile_size=args.size, tile_overlap=args.overlap, tile_format=args.format, image_quality=args.quality, resize_filter=args.filter)

for filespec in args.inputs:
  for filename in glob.glob(filespec):
    out = args.output + "/" + os.path.splitext(filename)[0] + '.dzi'
    print filename + " => " + out
    creator.create(filename, out)