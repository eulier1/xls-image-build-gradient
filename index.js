const _ = require('lodash')
const xlsx = require('node-xlsx')
const fs = require('fs')
const pngToJpeg = require('png-to-jpeg')
const vibrant = require('node-vibrant')
const Excel = require('exceljs')

const dirnameCSVImport = './assets/import/csv'
const dirnameCSVExport = './assets/export/csv'
const dirnameImgExport = './assets/export/img'
let gradientType = ''
let importNamefile = null

function processArguments (argv) {
  let arg = ['-l', '-f']
  let values = ['-l', '-f'] // here will be store the flags values

  argv.map((val, index, arr) => {
    if (val === arg[0]) {
      values[0] = (arr[index + 1] === undefined) ? null : arr[index + 1]
    }

    if (val === arg[1]) {
      values[1] = (arr[index + 1] === undefined) ? null : arr[index + 1]
    }
  })

  return { arg, values }
}

async function exportImageFromCSV (importNamefile) {
  if (importNamefile !== '') {
    const workSheetsFromFile = await xlsx.parse(`${dirnameCSVImport}/${importNamefile}`)

    return workSheetsFromFile
      .map((file) => file.data
        .map((cell) => {
          if (typeof cell[2] === 'string') {
            const imageName = cell[1]
            const imageBase64 = cell[2]
            const buffer = new Buffer.from(imageBase64.split(/,\s*/)[1], 'base64')
            pngToJpeg({ quality: 90 })(buffer)
              .then(output => {
                return fs.writeFileSync(`${dirnameImgExport}/${imageName}.jpeg`, output)
              })
          }
        })
      )
  }
  return null
};

async function getNameFiles (dirname) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirname, (err, filenames) => {
      err !== (undefined || null) ? reject(err) : resolve(filenames)
    })
  })
}

async function getColorsImage (dirname, filename, gradientType) {
  const path = `${dirname}/${filename}`
  let colors = []
  let alphaChannel = '77'
  let outletFormat = gradientType

  return vibrant.from(path).getPalette()
    .then((palette) => {
      // 0 Vibrant, 1 LightVibrant, 2 DarkVibrant, 3 Muted, 4 LightMuted, 5 DarkMuted
      for (const key in palette) {
        if (palette.hasOwnProperty(key)) {
          if (_.isFunction(_.get(palette, `${key}.getHex`))) {
            colors.push(`${palette[key].getHex()}${alphaChannel}`)
          }
        }
      }
      outletFormat = outletFormat + (colors.map((color, i) => colors.length - 1 === i ? `${color})` : `${color}`))
      return outletFormat
    })
};

function exportPaletteColorIconExcel (dataArray, dirPath) {
  var workbook = new Excel.Workbook()

  workbook.views = [
    {
      x: 0,
      y: 0,
      width: 10000,
      height: 20000,
      firstSheet: 0,
      activeTab: 1,
      visibility: 'visible'
    }
  ]

  var sheet = workbook.addWorksheet('Icon-colors')

  var worksheet = workbook.getWorksheet('Icon-colors')

  let dataElement = []
  for (let i = 0; i < dataArray.length; i++) {
    let counter = 0
    dataElement.push(dataArray[i])
    counter++

    if (counter < 2) {
      dataElement = _.flattenDeep(dataElement)
      console.log(dataElement)
      worksheet.addRow(dataElement)
      dataElement = []
    }
  }

  workbook.xlsx.writeFile(`${dirPath}/Colors.xlsx`)
    .then(function () {
      // done
      console.log('createExcel Done')
    })
}

/** ********************************************* Run Script *************************************************/

gradientType = processArguments(process.argv).values[0] === '-l' ? 'linear-gradient(' : processArguments(process.argv).values[0]
importNamefile = processArguments(process.argv).values[1] === null ? null : processArguments(process.argv).values[1]

Promise.resolve(exportImageFromCSV(importNamefile))
  .then(
    (isFileImported) => {
      if (isFileImported === null) {
        throw 'namefile not passed'
      }

      Promise.resolve(getNameFiles(dirnameImgExport)).then(

        (namePaths) => {
          let paletton = []
          namePaths.map((fileNamePath) => {
            Promise.resolve(getColorsImage(dirnameImgExport, fileNamePath, gradientType)).then(

              (colors) => {
                fileNamePath = fileNamePath.replace('.jpeg', '')
                paletton.push([fileNamePath, colors])
                exportPaletteColorIconExcel(paletton, dirnameCSVExport)
              }
            ).catch(
              (err) => { console.log('exportImageFromCSV', err) }
            )
          })
        }
      ).catch(
        (err) => { console.log('getNameFiles', err) }
      )
    }
  ).catch(
    (err) => { console.log('getColorsImage', err) }
  )
