#!/usr/bin/env python3
"""
Simple icon generator for PWA
Creates colored PNG icons without external dependencies
"""

def create_simple_png(filename, size, color_hex):
    """
    Create a simple solid color PNG using only Python standard library
    This creates a minimal valid PNG file
    """
    import struct
    import zlib

    # Convert hex color to RGB
    color = bytes.fromhex(color_hex.lstrip('#'))

    # Create image data (RGBA format)
    # Each pixel is 4 bytes: R, G, B, A (alpha)
    row = b'\x00' + (color + b'\xff') * size  # Filter byte + pixels
    raw_data = row * size

    # Compress the image data
    compressed = zlib.compress(raw_data, 9)

    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'

    def make_chunk(chunk_type, data):
        chunk = chunk_type + data
        crc = zlib.crc32(chunk) & 0xffffffff
        return struct.pack('!I', len(data)) + chunk + struct.pack('!I', crc)

    # IHDR chunk (image header)
    ihdr = struct.pack('!2I5B', size, size, 8, 6, 0, 0, 0)
    png += make_chunk(b'IHDR', ihdr)

    # IDAT chunk (image data)
    png += make_chunk(b'IDAT', compressed)

    # IEND chunk (image end)
    png += make_chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(png)

    print(f'Created {filename} ({size}x{size})')

if __name__ == '__main__':
    # Create icons with the theme color
    color = '667eea'  # Purple/blue from the site theme

    create_simple_png('icon-512.png', 512, color)
    create_simple_png('icon-192.png', 192, color)
    create_simple_png('apple-touch-icon.png', 180, color)

    print('All icons created successfully!')
