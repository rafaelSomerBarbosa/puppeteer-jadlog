const puppeteer = require('puppeteer');
const { PendingXHR } = require('pending-xhr-puppeteer');
const { exec } = require('child_process');

(async () => {
    try {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        const pendingXHR = new PendingXHR(page);

        await page.goto('http://www.jadlog.com.br/', { waitUntil: 'load' });

        await page.waitForNavigation({ waitUntil: 'load' });

        await page.evaluate(() => {
            console.log(document)
            const formBusca = document.querySelector('#form-buscar')

            formBusca.querySelector('#numero').value = 000000 //Insira o seu código aqui
            formBusca.submit()
        });

        await page.waitForNavigation({ waitUntil: 'load' });

        await page.evaluate(() => {
            document.querySelector('.ui-row-toggler.ui-icon.ui-icon-circle-triangle-e').click()
        });

        await pendingXHR.waitForAllXhrFinished()

        await page.evaluate(() => {
            document.querySelector('.fa.fa-truck').parentElement.parentElement.click()
        });

        await pendingXHR.waitForAllXhrFinished()

        const locationDelivery = await page.evaluate(() => {
            const header = Array.from(document.querySelector('.ui-datatable-tablewrapper').querySelectorAll('thead > tr > th')).map((item) => {
                return item.innerText
            })

            let responseBody = header.join(' | ');
            responseBody += "\n\n"

            Array.from(document.querySelector('.ui-datatable-tablewrapper').querySelectorAll('tbody > tr > td')).forEach((item, index) => {
                responseBody += item.innerText == '' ? 'Sem texto' : `${item.innerText} | `

                if((index +1) % header.length == 0) responseBody += "\n"
            })

            return responseBody
        });

        exec(`notify-send "${locationDelivery}"`, (err, stdout, stderr) => {
            if (err) {
              console.log(err)
              return;
            }          
          });

        console.log(locationDelivery)

        await browser.close();
    } catch (e) {
        console.log(e)
    }
})();