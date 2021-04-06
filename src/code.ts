figma.showUI(__html__, { width: 380, height: 480 })

const codiconTextStyleKey = '640604ee4b4f01ff327acfaaa8305c92199c7473'
const codiconTextStyleId = 'S:640604ee4b4f01ff327acfaaa8305c92199c7473,2712:14'
const codiconColorStyleKey = '41f0c94d560e9b73b202dfc059e411effca235a4'
const codiconColorStyleId = 'S:41f0c94d560e9b73b202dfc059e411effca235a4,2919:50'

const setiTextStyleKey = '499eeb6b308eeb612583df30b0a4fd990d4dbbc5'
const setiTextStyleId = 'S:499eeb6b308eeb612583df30b0a4fd990d4dbbc5,940:8'
const setiColorStyleKey = '9fc238b130e8f6f24ab1ecfaff5ecd1f1389528f'
const setiColorStyleId = 'S:9fc238b130e8f6f24ab1ecfaff5ecd1f1389528f,2919:5'

const nodes: SceneNode[] = [];
const data = require('./assets/codicon.json5')
const icons = data['default']

// load fonts
async function loadFonts() {
  await figma.loadFontAsync({ family: "Roboto", style: "Regular" })
  await figma.loadFontAsync({ family: "codicon", style: "Regular" }).catch(e => {
    console.log(e)
    figma.ui.postMessage({ type: 'hasIcons', codicons: false })
    return false;
  })
  await figma.loadFontAsync({ family: "seti", style: "Regular" }).catch(e => {
    console.log(e)
    figma.ui.postMessage({ type: 'hasIcons', seti: false })
    return false;
  })
  await figma.importStyleByKeyAsync(codiconTextStyleKey).catch(e => {
    console.log(e)
  })
}
loadFonts()

figma.ui.onmessage = async msg => {

  const nodes = []

  if (msg.type === 'create-icon') {

    // create new text object
    if (figma.currentPage.selection.length == 0) {

      console.log('creating new text object')
      const text: TextNode = figma.createText()
      text.characters = msg.glyph
      text.fontSize = 16

      if (msg.library == 'seti') {
        text.name = 'seti: ' + msg.name
        text.fontName = { family: "seti", style: "Regular" }

        await figma.importStyleByKeyAsync(setiTextStyleKey)
        await figma.importStyleByKeyAsync(setiColorStyleKey)
        text.textStyleId = setiTextStyleId
        text.fillStyleId = setiColorStyleId
      } if (msg.library == 'codicon') {
        text.name = 'codicon: ' + msg.name
        text.fontName = { family: "codicon", style: "Regular" }

        await figma.importStyleByKeyAsync(codiconTextStyleKey)
        await figma.importStyleByKeyAsync(codiconColorStyleKey)
        text.textStyleId = codiconTextStyleId
        text.fillStyleId = codiconColorStyleId
      }

      nodes.push(text)
      figma.currentPage.selection = nodes
      figma.viewport.scrollAndZoomIntoView(nodes)

    } else {

      console.log('replace text object')

      let selectionLength = figma.currentPage.selection.length

      for (let i = 0; i < selectionLength; i++) {

        // unload current font
        let selection = <TextNode>figma.currentPage.selection[i]
        let currentFontName = selection.fontName
        await figma.loadFontAsync({ family: `${currentFontName['family']}`, style: `${currentFontName['style']}` });

        let currentFont = <String>currentFontName['family']
        let text = <TextNode>selection
        text.characters = msg.glyph


        // override styles if not codicon
        if (msg.library == 'codicon' && currentFont !== 'codicon') {
          text.name = 'codicon: ' + msg.name
          text.fontName = { family: "codicon", style: "Regular" }

          await figma.importStyleByKeyAsync(codiconTextStyleKey)
          await figma.importStyleByKeyAsync(codiconColorStyleKey)
          text.textStyleId = codiconTextStyleId

        }

        // override styles if not seti
        if (msg.library == 'seti' && currentFont !== 'seti') {
          text.name = 'seti: ' + msg.name
          text.fontName = { family: "seti", style: "Regular" }

          await figma.importStyleByKeyAsync(setiTextStyleKey)
          await figma.importStyleByKeyAsync(setiColorStyleKey)
          text.textStyleId = setiTextStyleId
        }


        nodes.push(text)

      }

      figma.currentPage.selection = nodes

    }
  }
}