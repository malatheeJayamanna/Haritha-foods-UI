# Haritha Foods Product - Website

Static website (HTML, CSS, JavaScript) for Haritha Foods Product: dehydrated fruits, vegetables, flowers and herbs, with private label and export.

## Open it
Double-click `index.html`. No build step is needed.

## Pages
`index`, `about`, `products`, `product` (detail, `?p=pineapple`), `private-label`, `export`, `gallery`, `contact`, `register`, `login`, `order`

## Before going live
1. Set `WHATSAPP_NUMBER` at the top of `js/main.js` (country code + number, e.g. `94771234567`).
2. Replace every `[bracketed placeholder]` with real details (phone, email, address, MOQ, export info).
3. Replace the `[Photo]` / `[Video]` boxes with real `<img>` / `<video>` tags (put files in `assets/images/`).
4. Add real social media URLs in the footer of each page.

## Register / login / order (sample only)
Accounts and orders are saved in the visitor's own browser (`localStorage`). This is a demo: orders are not sent to the business.
For the real site use a server (for example WordPress users + WooCommerce, or a backend with a database).

## Colours
Defined in `:root` at the top of `css/style.css` (leaf green, gold, brown, taken from the logo).
