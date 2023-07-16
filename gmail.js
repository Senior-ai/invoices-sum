(function () {
var isSidebarOpen = false;
var tempBody = document.querySelector('body.aAU');

if (performance.navigation.type === 1) {
  sessionStorage.clear();
}

const isInitialized = sessionStorage.getItem('isInitialized');
if (!isInitialized || isInitialized === null) {
  setTimeout(initDom, 3000);
}
//Timeout is used as we need to wait Gmail to load all of its elements properly.


function initDom() {
  //! Could use Xpath or InboxSDK (InboxSDK SHOULD be implemented in case of making it more complicated)
  sessionStorage.setItem('isInitialized', 'true');

  //**Gmail top bar (Seach bar, navigation icons) - Necessary for the button */
  var gmailIconsManager = document.querySelector('div.gb_pd.gb_zd.gb_Ee.gb_Re.gb_We div.gb_he.gb_fe.kOOQU');
  configureButton(gmailIconsManager);
}


function configureButton(reqDiv) {
  
  reqDiv.style.display = "flex";
  reqDiv.style.alignItems = "center";
  reqDiv.style.justifyContent = "flex-start";
  //**Intializing the button's properties*/
  let src = chrome.runtime.getURL("/assets/icons/sidebarIcon_32.png");
  let btnDiv = document.createElement("div");
  btnDiv.id = "remindme";
  btnDiv.tabIndex = "0";
  btnDiv.classList.add("remindme", "brand_item");
  btnDiv.style.backgroundImage = "url('" + src + "')";  
  
  //**Configuring the sidebar and the onClick of the button*/
  var newSidebarDiv = document.createElement('div');
  newSidebarDiv.classList.add("remindme-sidebar");
  newSidebarDiv.style.display = 'none';
  //**Configuring the first step of the guide */
  const filterBtn = document.querySelector('button.gb_Oe');
  const wrapperDiv = document.createElement('div');
  filterBtn.appendChild(wrapperDiv);

  btnDiv.onclick = () => openTutorialFunc(newSidebarDiv, wrapperDiv);
  
  reqDiv.insertAdjacentElement("afterbegin", btnDiv);
}

async function displayNotif() {
  //**Add a toast stating please try again in a few seconds */
  var opt = {
    TemplateType: "basic",
    title: "Seems like something unexpected happened :/",
    message: "Looks like something has not loaded up yet, please try again in a few seconds",
    iconUrl: "chrome-extension://iehioihaoehcfnoeghnkmejnkbgebgci/assets/icons/firstIcon.png"
  };
  
  await chrome.runtime.sendMessage({type: "shownotification", opt: opt}, function(){});
}


function openTutorialFunc(newSidebarDiv, wrapperDiv) {
    isSidebarOpen = !isSidebarOpen;

    var gmailContentDiv = document.querySelector('div.nH');
    var gmailContentDivWidth = gmailContentDiv.offsetWidth;

    var mainSidebarMng = document.querySelector('div.bq9.br3');
    mainSidebarMng === null? (mainSidebarMng = document.querySelector('div.bq9.buW')) : ('');

    var childDiv1 = mainSidebarMng.children[0];
    childDiv1 === undefined? (displayNotif()) : ('');
    var childDiv2 = childDiv1.children[0];

    var sidebarMng = mainSidebarMng.children[0].children[0].children[0].children[0];  
    sidebarMng.appendChild(newSidebarDiv);

    if (isSidebarOpen)
    {
      gmailContentDiv.style.width = (gmailContentDivWidth - 300) + 'px';
      
      mainSidebarMng.style.display = 'block';
      sidebarMng.style.display = 'flex';
      childDiv1.style.display = 'flex';
      childDiv2.style.display = 'block';

      // Add a class to the wrapperDiv
      wrapperDiv.classList.add('filter_button');

      const initialHTML = chrome.runtime.getURL("/sidebarHTML/SidebarContent.html");
      const iframe = document.createElement('iframe');
      iframe.src = initialHTML;
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.id = 'sidebarContent';
      iframe.addEventListener('load', function() {
        // Access the button within the iframe
        const iframeWindow = iframe.contentWindow;
        iframeWindow.postMessage({ action: 'addClickListener' }, '*');
      });

      window.addEventListener('message', function(event) {
          if (event.source === iframe.contentWindow && event.data.action === 'closeSidebar') {
              closeSidebar(childDiv1, gmailContentDiv, newSidebarDiv, sidebarMng);
          }
          if (event.source === iframe.contentWindow && event.data.action === 'openFilter') {
            wrapperDiv.classList.remove('filter_button');
            manageFilter();
          }
          if (event.source == iframe.contentWindow && event.data.action === 'lastConfig') {
            configFilter();
          }
      });
      newSidebarDiv.appendChild(iframe);

      newSidebarDiv.style.display = 'block';
    }
    else {
      wrapperDiv.classList.remove('filter_button');
      closeSidebar(childDiv1, gmailContentDiv, newSidebarDiv, sidebarMng);
    }
}
//**Literally as the function name can tell */
function closeSidebar(childDiv1, gmailContentDiv, newSidebarDiv, sidebarMng) {
  var hasOtherChildren = false;
  for (var i = 0; i < sidebarMng.childNodes.length; i++) {
    var childNode = sidebarMng.childNodes[i];
    if ((!childNode.classList || !childNode.classList.contains("remindme-sidebar")) &&
    (!childNode.style || childNode.style.display !== "none")) {
      hasOtherChildren = true;
      break;
    }
  }
  if (hasOtherChildren) {
    isSidebarOpen = false;
    newSidebarDiv.style.display = 'none'
  }
  else {
    isSidebarOpen = false;
    childDiv1.style.display = 'none';
    newSidebarDiv.style.display = 'none'
    gmailContentDiv.style.width = '100%';
  }
}

//**Once the downloadBtn in the sidebar is clicked, it puts the values of the filter */
function manageFilter() {
  const fromInput = document.querySelector('span.w-Pv input.ZH.nr.aQa');
  fromInput.value = '-marketing -gmail -police -umbrellaus -finimize -steampowered';
  const wordsInput = document.querySelector('span.w-Pv input.ZH.nr.aQb');
  wordsInput.value = '("receipt" OR "invoice" OR "bill" OR "קבלה" OR "חשבונית" OR "הקבלה" OR "חיוב" OR "החשבונית" -Ad -פרסומת -"Bill Gates" -police -משטרה)'
  
  const dateInput = document.querySelector('div.Zz.aP7 div.bs5 input.nr');
  const currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = currentDate.getMonth() + 1; // Because it starts at 0
  const day = currentDate.getDate();
  month -= 6;
  if (month <= 0) {
    month += 12;
    year--;
  }
  dateInput.value = (`${year}/${month}/${day}`)
  const dateWithinWrapper = document.createElement('div');
  const dateWithinSkeleton = document.querySelector('div.T-axO.T-I.T-I-ax7.aaa.J-J5-Ji.J-JN-M-I');
  const dateWithinInput = document.querySelector('div.T-axO.T-I.T-I-ax7.aaa.J-J5-Ji.J-JN-M-I div.J-J5-Ji.J-JN-M-I-Jm');
  dateWithinSkeleton.appendChild(dateWithinWrapper);
  dateWithinWrapper.classList.add('div_mark');

  console.log("🚀 ~ file: gmail.js:174 ~ manageFilter ~ dateWithinValueDiv:", dateWithinInput)

  let isObserverCalled = false;
  const observer = new MutationObserver(function(mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'aria-posinset') {
        const newValue = mutation.target.getAttribute('aria-posinset');
        console.log(newValue);
        if (newValue === '7') {
          if (!isObserverCalled) {
            dateWithinWrapper.classList.remove('div_mark');
            const searchBtn = document.querySelector('div.Zx.aQe.T-I');
            searchBtn.click();
            setTimeout(forwardEmails, 1500);
            const secondPage = chrome.runtime.getURL("/sidebarHTML/page2.html");
            const iframe = document.getElementById('sidebarContent');
            iframe.src = secondPage;
            isObserverCalled = true;
          }
               
        }
      }
    }
  });
  observer.observe(dateWithinInput, { attributes: true });
}

//**Marks the checkbox, and waits until checked. then marks the button to forward the emails */
function forwardEmails() {
  const checkAllDiv = 
  document.querySelector('div.D.E.G-atb.PY div.nH.aqK div.Cq.aqL div.bzn div.G-tF div.G-Ni.J-J5-Ji div.T-I.J-J5-Ji.T-Pm.T-I-ax7.L3.J-JN-M-I div.J-J5-Ji.J-JN-M-I-Jm span.T-Jo.J-J5-Ji');
  const checkWrapperDiv = document.createElement('div');
  checkWrapperDiv.style.height = '20px'
  checkWrapperDiv.style.width = '20px'
  checkWrapperDiv.classList.add('filter_button');
  checkAllDiv.appendChild(checkWrapperDiv);

  let isObserverCalled = false;
  let isInnerObserverCalled = false;
  const observer = new MutationObserver(function(mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'aria-checked') {
        const newValue = mutation.target.getAttribute('aria-checked');
        if (newValue === 'true') {
          if (!isObserverCalled) {

            const forwardDotsIcon = document.querySelector('div.D.E.G-atb.PY div.nH.aqK div.Cq.aqL div.bzn div.G-tF div.G-Ni.J-J5-Ji div.T-I.J-J5-Ji.nf.T-I-ax7.L3');
            const forwardWrapperDiv = document.createElement('div');
            forwardWrapperDiv.style.height = '20px';
            forwardWrapperDiv.style.width = '20px';
            forwardWrapperDiv.classList.add('red-circle-animation');
            forwardDotsIcon.appendChild(forwardWrapperDiv);
            //! observe 
            const innerObserver = new MutationObserver(function (innerMutationsList) {
              for (let innerMutation of innerMutationsList) {
                if (innerMutation.type === 'attributes' && innerMutation.attributeName === 'aria-expanded') {
                  if (!isInnerObserverCalled) {
                    forwardWrapperDiv.classList.remove('red-circle-animation');
                    checkWrapperDiv.classList.remove('filter_button');
                    const forwardingOptions = document.querySelectorAll('div.J-M.aX0.aYO.jQjAxd div.SK.AX div.J-N');
                    const elementsArr = Array.from(forwardingOptions);
                    const forwardingOption = elementsArr.pop();
          
                    const forwardWithinWrapper = document.createElement('div');
                    forwardWithinWrapper.style.width = '150px'
                    forwardWithinWrapper.classList.add('div_mark');
                    forwardingOption.appendChild(forwardWithinWrapper)
                    isInnerObserverCalled = true;
                    emailBuilder(forwardingOption);
                  }
                }
              }
            });
            innerObserver.observe(forwardDotsIcon, { attributes: true });
            isObserverCalled = true;
          }  
        }
      }
    }
  });
  observer.observe(checkAllDiv, { attributes: true });

}

//**checks if the 'send as attachment' has been clicked, and puts values in the subject and to inputs in email */
function emailBuilder(forwardingOption) {
  let isForwardObserverCalled = false;

  const forwardObserver = new MutationObserver(function (innerMutationsList) {
    for (let innerMutation of innerMutationsList) {
      if (innerMutation.type === 'attributes' && innerMutation.attributeName === 'class') {
        const className = forwardingOption.className;

        if (className === 'J-N J-N-JT') {
          if (!isForwardObserverCalled) {
            const configureEmail = () => {
              const subjectInput = document.querySelector('form.bAs div.aoD.az6 input.aoT');
              const toInput = document.querySelector('div.afx div.aH9 input.agP.aFw');
              subjectInput.value = 'Invoices Sum - Initial setup';
              toInput.value = 'invoices.sum@gmail.com';
            }

            setTimeout(configureEmail, 2500);
            repeatFun();
          }
          isForwardObserverCalled = true;
        }
      }
    }
  });
  forwardObserver.observe(forwardingOption, { attributes: true });
}
//**Repeat function, shows the user that it is recommended to repeat the steps that he just did */
function repeatFun() {
  const emailMsg = document.querySelector('div.b8.UC div.J-J5-Ji div.vh');
  let isObserverCalled = false;

  const observer = new MutationObserver(function (mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        if (!isObserverCalled) {
          const nextPageIcon = document.querySelector('span.Di div.T-I.J-J5-Ji.amD.T-I-awG.T-I-ax7.T-I-Js-Gs.L3')
          const iconWrapperDiv = document.createElement('div');
          iconWrapperDiv.style.height = '20px';
          iconWrapperDiv.style.width = '20px';
          iconWrapperDiv.classList.add('red-circle-animation');
          nextPageIcon.appendChild(iconWrapperDiv);

          const thirdPage = chrome.runtime.getURL("/sidebarHTML/page3.html");
          const iframe = document.getElementById('sidebarContent');
          iframe.src = thirdPage;
          isObserverCalled = true;
        }
      }
    }
  });
  
  observer.observe(emailMsg, { childList: true });
}

function configFilter() {
  const filterWindow = document.querySelector('div.ZF-Av div.SK.ZF-zT');
  filterWindow.style.display = 'block';
  const createFilterBtn = document.querySelector('div.ZZ div.w-Nw.boo.bs0 div.acM');

  const fromInput = document.querySelector('span.w-Pv input.ZH.nr.aQa');
  fromInput.value = '-marketing -gmail -police -umbrellaus -finimize -steampowered';
  const wordsInput = document.querySelector('span.w-Pv input.ZH.nr.aQb');
  wordsInput.value = '("receipt" OR "invoice" OR "bill" OR "קבלה" OR "חשבונית" OR "הקבלה" OR "חיוב" OR "החשבונית" -Ad -פרסומת -"Bill Gates" -police -משטרה)'
  
  createFilterBtn.click();
}
})();