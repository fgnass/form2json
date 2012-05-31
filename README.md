# About

Form2json is a decoder for [x-www-form-urlencoded](http://www.w3.org/MarkUp/html-spec/html-spec_8.html#SEC8.2.1) data
that supports complex structures. It uses simple dot-notation for nested properties and square brackets to denote arrays.

# Syntax

Here are some examples to illustrate the syntax.

## Nested Objects

The following string represents a nested object:

    planet.name=Mars&planet.diameter=0.532

The string will be decoded as:

	{
		planet: {
			name: "Mars",
			diameter: 0.532
		}
	}

There are no restrictions on the nesting-level:

	planet.mars.diameter=0.532&planet.mars.mass=0.11

	{
		planet: {
			mars: {
				diameter: 0.532,
				mass: 0.11
			}
		}
	}

## Arrays

Arrays can be encoded using square brackets:

    planets[0]=Venus&planets[1]=Earth&planets[2]=Mars

	{
		planets: ["Venus", "Earth", "Mars"]
	}

If the index is **omitted**, form2json will push the values to the array in **order of appearance**:

	planets[]=Mars&planets[]=Venus&planets[]=Earth

	{
		planets: ["Mars", "Venus", "Earth"]
	}

This feature is really useful, as it allows you to re-order the input fields on the client, without having to update the field names. In order to use this feature with arrays containing nested objects, we have to use a slightly different syntax:

	planets[$2].name=Mars&planets[$2].mass=0.11&planets[$0].name=Venus&planets[$0].mass=0.82&planets[$1].name=Earth&planets[$1].mass=1

	{
		planets: [
			{ name: "Mars", mass: 0.11 },
			{ name: "Venus, mass: 0.82 },
			{ name: "Earth", mass: 1 }
		]
	}

In fact you may use *any non-numerical* value as index. All items having the *same* index will be grouped into one object.

# Connect Middleware

You can use form2json together with the bodyDecoder middleware:

    require('connect')middleware.bodyDecoder.decode['application/x-www-form-urlencoded'] = require('form2json').decode;
