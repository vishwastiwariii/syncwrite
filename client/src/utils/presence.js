/* Presence colours drawn from the design system's avatar palette. */
const COLORS = ["#8f7bff", "#5ec5a0", "#f6a94b", "#e15a7e", "#2b7cff", "#28a56c"];

export const colorFor = (i) => COLORS[i % COLORS.length];

export const initialOf = (name) => (name ? name.charAt(0).toUpperCase() : "?");
