# -*- coding: utf-8 -*-
from __future__ import print_function

import sys
from itertools import chain
from itertools import cycle

import pytest
import requests


TEST_HOSTNAME = 'localhost'
TEST_PORT = 4301


ANDROID_PHONE_UA = [
    # Samsung Galaxy S6
    'Mozilla/5.0 (Linux; Android 6.0.1; SM-G920V Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36',
    # Samsung Galaxy S6 Edge Plus
    'Mozilla/5.0 (Linux; Android 5.1.1; SM-G928X Build/LMY47X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.83 Mobile Safari/537.36',
    # Nexus 6P
    'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 6P Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.83 Mobile Safari/537.36',
    # Sony Xperia Z5
    'Mozilla/5.0 (Linux; Android 6.0.1; E6653 Build/32.2.A.0.253) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36',
    # HTC One M9
    'Mozilla/5.0 (Linux; Android 6.0; HTC One M9 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36',
]
ANDROID_TABLET_UA = [
    # Google Pixel C
    'Mozilla/5.0 (Linux; Android 7.0; Pixel C Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/52.0.2743.98 Safari/537.36',
    # Sony Xperia Z4
    'Mozilla/5.0 (Linux; Android 6.0.1; SGP771 Build/32.2.A.0.253; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/52.0.2743.98 Safari/537.36',
    # Nvidia Shield Tablet
    'Mozilla/5.0 (Linux; Android 5.1.1; SHIELD Tablet Build/LMY48C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Safari/537.36',
    # Samsung Galaxy Tab A
    'Mozilla/5.0 (Linux; Android 5.0.2; SAMSUNG SM-T550 Build/LRX22G) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/3.3 Chrome/38.0.2125.102 Safari/537.36',
]
ANDROID_WEBVIEW_UA = [
    # KitKat
    'Mozilla/5.0 (Linux; U; Android 4.1.1; en-gb; Build/KLP) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30',
    # Lillipop
    'Mozilla/5.0 (Linux; Android 4.4; Nexus 5 Build/_BuildID_) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36',
    # Lollipop+
    'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 5 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36'
]
IPHONE_UA = [
    # iOS 7
    'Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_4 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B350 Safari/8536.25',
    # iOS 6
    'Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_3 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B329 Safari/8536.25',
    # iOS 5
    'Mozilla/5.0 (iPhone; CPU iPhone OS 5_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9B206 Safari/7534.48.3',
]
IPAD_UA = [
    # iOS 7
    'Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) CriOS/30.0.1599.12 Mobile/11A465 Safari/8536.25 (3B92C18B-D9DE-4CB7-A02A-22FD2AF17C8F)',
    # iOS 5
    'Mozilla/5.0 (iPad; CPU OS 5_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9B206 Safari/7534.48.3'
]
WINDOW_PHONE_UA = [
    # MS Lumia 950
    'Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia 950) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/13.10586',
]
DESKTOP_BROWSER_UA = [
    # Firefox on Windows
    'Mozilla/5.0 (Windows NT x.y; rv:10.0) Gecko/20100101 Firefox/10.0',
    # Firefox on OSX
    'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:10.0) Gecko/20100101 Firefox/10.0',
    # Firefox on Linux i686
    'Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/10.0',
    # Firefox on Linux x86_64
    'Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0',
    # Google Chrome on Win 10
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
    # Google Chrome on Win 7
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
    # Google Chrome on OSX
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
    # Google Chrome on Linux
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
    # Firefox on Win 10
    'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:48.0) Gecko/20100101 Firefox/48.0',
    # Firefox on OSX
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:47.0) Gecko/20100101 Firefox/47.0',
    # Firefox on Linux
    'Mozilla/5.0 (X11; Linux x86_64; rv:45.0) Gecko/20100101 Firefox/45.0',
    # Safari on OSX
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.8 (KHTML, like Gecko) Version/9.1.3 Safari/601.7.8',
    # IE 11 on Win 7
    'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
]
MOBILE_BROWSER_UA = [
    # Firefox on Android
    'Mozilla/5.0 (Android; Mobile; rv:40.0) Gecko/40.0 Firefox/40.0',
    # Firefox OS phone
    'Mozilla/5.0 (Mobile; rv:26.0) Gecko/26.0 Firefox/26.0',
]


def is_mweb(resp):
    # We force www site to its own status code.
    return resp.status_code == 200


def is_www(resp):
    return resp.status_code == 400


@pytest.mark.parametrize(
    'user_agent_string, validation_fn',
    chain(
        zip(DESKTOP_BROWSER_UA, cycle([is_www])),
        zip(ANDROID_PHONE_UA, cycle([is_mweb])),
        zip(ANDROID_TABLET_UA, cycle([is_mweb])),
        zip(ANDROID_WEBVIEW_UA, cycle([is_mweb])),
        zip(IPAD_UA, cycle([is_mweb])),
        zip(IPHONE_UA, cycle([is_mweb])),
        zip(WINDOW_PHONE_UA, cycle([is_mweb])),
        zip(MOBILE_BROWSER_UA, cycle([is_mweb])),
    )
)
def test_user_agent(user_agent_string, validation_fn):
    resp = requests.get(
        'http://%s:%s/' % (TEST_HOSTNAME, TEST_PORT),
        headers={'User-Agent': user_agent_string},
    )
    assert validation_fn(resp) is True


@pytest.mark.parametrize(
    'user_agent_string, cookies, validation_fn',
    [
        (DESKTOP_BROWSER_UA[0], None, is_www),
        (DESKTOP_BROWSER_UA[0], {'mweb-no-redirect': '0'}, is_www),
        (DESKTOP_BROWSER_UA[0], {'mweb-no-redirect': '1'}, is_www),
        (ANDROID_PHONE_UA[0], None, is_mweb),
        (ANDROID_PHONE_UA[0], {'mweb-no-redirect': '0'}, is_mweb),
        (ANDROID_PHONE_UA[0], {'mweb-no-redirect': '1'}, is_www),
        (MOBILE_BROWSER_UA[0], None, is_mweb),
        (MOBILE_BROWSER_UA[0], {'mweb-no-redirect': '0'}, is_mweb),
        (MOBILE_BROWSER_UA[0], {'mweb-no-redirect': '1'}, is_www),
        # Test multiple cookies where the override cookie can be in the middle
        # since we're using regex string detection.
        (
            MOBILE_BROWSER_UA[0],
            {
                'foo': 'bar',
                'mweb-no-redirect': '1',
                'zab': 'zoo',
            },
            is_www
        ),
    ]
)
def test_cookie_override(user_agent_string, cookies, validation_fn):
    resp = requests.get(
        'http://%s:%s/' % (TEST_HOSTNAME, TEST_PORT),
        headers={'User-Agent': user_agent_string},
        cookies=cookies,
    )
    assert validation_fn(resp) is True


if __name__ == '__main__':
    print('Run Python tests via tox.')
    sys.exit(1)
