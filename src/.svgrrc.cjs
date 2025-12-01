/** @type import('@svgr/core').Config */
module.exports = {
	// Don't force 1em icons, keep your logo's viewBox
	icon: false,

	// Turn specific fills into currentColor
	replaceAttrValues: {
		'#000': 'currentColor',
		'#000000': 'currentColor',
		'#44403B': 'currentColor',
		'#BBF451': 'currentColor',
	},

	svgProps: {
		// fallback if an element has no fill set
		fill: 'currentColor',
	},
};
