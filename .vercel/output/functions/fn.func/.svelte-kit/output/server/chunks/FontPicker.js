class FontPicker {
  resultCache = /* @__PURE__ */ new Map();
  /**
   * Gets the largest font size that will fit on the wheel for all the given texts
   * @param context 2D canvas context
   * @param texts Array of texts to fit on the wheel
   * @param wheelRadius Outer radius of the wheel
   * @param hubRadius Inner radius of the wheel
   * @param smallestAngle Angle of the smallest slice on the wheel
   * @returns CSS font string
   */
  getFont(context, texts, wheelRadius, hubRadius, smallestAngle) {
    const cachedResult = this.getCachedResult(
      texts,
      wheelRadius,
      hubRadius,
      smallestAngle
    );
    if (cachedResult) return cachedResult;
    let minFontSize = 200;
    const fontName = "Quicksand";
    texts.forEach((text) => {
      const fontSize = getFontSize(
        context,
        text,
        fontName,
        wheelRadius,
        hubRadius,
        smallestAngle
      );
      if (fontSize < minFontSize) {
        minFontSize = fontSize;
      }
    });
    const font = `500 ${minFontSize}px ${fontName}`;
    this.cacheResult(texts, wheelRadius, hubRadius, smallestAngle, font);
    return font;
  }
  getCachedResult(texts, wheelRadius, hubRadius, smallestAngle) {
    return this.resultCache.get(
      getCacheKey(texts, wheelRadius, hubRadius, smallestAngle)
    );
  }
  cacheResult(texts, wheelRadius, hubRadius, smallestAngle, font) {
    this.resultCache.set(
      getCacheKey(texts, wheelRadius, hubRadius, smallestAngle),
      font
    );
  }
  clearFontCache() {
    this.resultCache.clear();
  }
}
const getFontSize = (context, displayText, fontName, wheelRadius, hubRadius, smallestAngle) => {
  return bisectSearch(
    context,
    wheelRadius,
    hubRadius,
    smallestAngle,
    fontName,
    displayText,
    3,
    200
  );
};
const bisectSearch = (context, wheelRadius, hubRadius, smallestAngle, fontName, text, min, max) => {
  let fontSize;
  do {
    fontSize = Math.round((min + max) / 2);
    if (textFits(
      context,
      wheelRadius,
      hubRadius,
      smallestAngle / 2,
      text,
      `500 ${fontSize}px ${fontName}`,
      fontSize
    )) {
      min = fontSize;
    } else {
      max = fontSize;
    }
  } while (Math.abs(max - min) >= 2);
  return fontSize;
};
const textFits = (context, radius, innerRadius, angle, text, font, height) => {
  if (!text) {
    return true;
  }
  context.font = font;
  const { width } = context.measureText(truncateText(text));
  return boxFits(angle, radius, innerRadius, width, height);
};
const boxFits = (angle, radius, innerRadius, width, height) => {
  return (radius ** 2 - (height / 2) ** 2) ** 0.5 - Math.max(
    height * Math.cos(angle) / (2 * Math.sin(angle)),
    innerRadius
  ) >= width;
};
const getCacheKey = (texts, wheelRadius, hubRadius, smallestAngle) => {
  return JSON.stringify({ texts, wheelRadius, hubRadius, smallestAngle });
};
const truncateText = (text) => {
  if (text.length <= 18) {
    return text;
  }
  return text.substring(0, 17) + "…";
};
const getTextColor = (bgColor) => {
  const luminance = getColorLuminance(bgColor);
  const whiteContrastRatio = 1.05 / (luminance + 0.05);
  const blackContrastRatio = (luminance + 0.05) / 0.05;
  if (whiteContrastRatio > blackContrastRatio) {
    return "#FFFFFF";
  }
  return "#000000";
};
const hexToRatio = (hex) => {
  return Number(`0x${hex}`) / 255;
};
const getColorLuminance = (color) => {
  color = color.replace("#", "");
  const sRgbColors = [
    hexToRatio(color.substring(0, 2)),
    hexToRatio(color.substring(2, 4)),
    hexToRatio(color.substring(4, 6))
  ];
  const c = sRgbColors.map((color2) => {
    if (color2 <= 0.03928) {
      return color2 / 12.92;
    }
    return ((color2 + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export {
  FontPicker as F,
  getTextColor as g,
  truncateText as t
};
