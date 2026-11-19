# education-news-site 배포

프로젝트와 Hosting 사이트를 모두 `education-news-site`로 고정했습니다. `dist/`만 배포하며 Firestore, Authentication, 다른 Hosting 사이트는 변경하지 않습니다.

배포 성공 후 주소:

- https://education-news-site.web.app
- https://education-news-site.firebaseapp.com

## 직접 배포

```bash
npm ci
npx --yes firebase-tools@15.9.0 login
npm run deploy:firebase
```

프로젝트 권한이 있는 Google 계정으로 로그인해야 합니다. 원격 터미널에서 로그인하는 경우 `login --no-localhost`를 사용합니다. `deploy:firebase`는 검사를 통과한 결과물만 `--only hosting --project education-news-site`로 배포합니다.

## GitHub 자동 배포

1. Firebase의 공식 GitHub 연동(`firebase init hosting:github`)을 사용하거나, Hosting 배포 권한을 가진 프로젝트의 서비스 계정 인증을 준비합니다. 기존 `.firebaserc`와 `firebase.json`은 유지합니다.
2. 저장소 Settings → Secrets and variables → Actions에 `FIREBASE_SERVICE_ACCOUNT_EDUCATION_NEWS_SITE`라는 시크릿으로 서비스 계정 JSON을 등록합니다. JSON을 채팅이나 공개 코드에 올리지 않습니다.
3. Actions → Deploy Goodsay to Firebase Hosting → Run workflow를 실행합니다. 이후 main 변경은 자동 배포됩니다.

인증 시크릿이 없으면 명확한 오류와 함께 중단하며 다른 프로젝트로 우회하거나 배포 성공을 표시하지 않습니다. 이 배포는 체험/샘플 웹만 공개하며 실제 결제·인증·개인 해설 기능을 추가하지 않습니다.

앱은 해시 라우팅을 사용하므로 SPA rewrite를 추가하지 않았습니다. 따라서 미연결 `/api/**`를 index.html로 위장하지 않습니다.

공식 안내: https://firebase.google.com/docs/hosting/github-integration
