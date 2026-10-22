# Cahier des charges — Reverse Audio

**Version :** 1.0  
**Type :** Application de jeu audio multijoueur local  
**Plateformes cibles :** Web, mobile et ordinateur  
**Langue initiale :** Français  
**Mode de jeu :** Deux joueurs utilisant le même appareil

## 1. Présentation du projet

### 1.1. Contexte

Reverse Audio est un jeu de divertissement basé sur l'inversion des enregistrements vocaux. Deux joueurs utilisent un même smartphone, une tablette ou un ordinateur pour participer à une partie.

Le premier joueur enregistre un mot ou une phrase. Le deuxième écoute cet enregistrement à l'envers, puis tente d'imiter le son entendu. L'application inverse ensuite son imitation pour permettre aux joueurs de découvrir le résultat.

Le jeu repose sur la prononciation, l'écoute et la capacité à reproduire des sons de manière amusante.

### 1.2. Objectif principal

Développer une application simple, intuitive et responsive permettant de :

- Enregistrer la voix d'un joueur à partir du microphone.
- Inverser réellement un enregistrement audio.
- Écouter l'enregistrement original et sa version inversée.
- Enregistrer une imitation vocale.
- Inverser cette imitation pour obtenir le résultat final.
- Comparer les enregistrements et rejouer autant de fois que nécessaire.

### 1.3. Public cible

L'application s'adresse aux amis, aux familles et aux groupes de joueurs souhaitant jouer ensemble sur un seul appareil, sans création de compte ni installation obligatoire.

## 2. Règles du jeu

Le jeu se déroule en quatre phases principales.

### Phase 1 — Enregistrement du mot secret

Le joueur 1 choisit librement un mot, un nom de personnage, une expression ou une phrase.

Exemple : « Lionel Messi ».

Il appuie sur le bouton d'enregistrement, prononce le mot et arrête l'enregistrement. L'application conserve cet audio comme référence pour la partie.

### Phase 2 — Écoute de l'audio inversé

Le joueur 2 prend le relais et appuie sur le bouton permettant d'écouter la version inversée de l'enregistrement initial.

L'application inverse le signal sonore, et non simplement l'ordre des mots.

Le joueur 2 entend alors un son qui peut ressembler approximativement à « Issem lenoiL », selon la voix, la prononciation et la façon dont le son est perçu.

Le joueur 2 peut réécouter cet audio autant de fois que les règles de la partie le permettent.

### Phase 3 — Imitation du son inversé

Le joueur 2 tente de reproduire oralement le son qu'il vient d'entendre.

Il appuie sur le bouton d'enregistrement de son imitation, prononce le son à sa manière, puis arrête l'enregistrement.

L'application enregistre exactement cette nouvelle prononciation, sans la corriger ni la transformer automatiquement.

### Phase 4 — Inversion de l'imitation et découverte du résultat

Le joueur 2 appuie sur le bouton d'inversion de son imitation.

L'application inverse ce nouvel enregistrement et lit le résultat obtenu.

Si le joueur a reproduit suffisamment fidèlement le son entendu à la phase 2, le résultat peut ressembler à « Lionel Messi ».

Le résultat n'est pas garanti : il dépend de la prononciation, du rythme, de l'articulation et des caractéristiques de l'enregistrement.

Les joueurs peuvent alors écouter les différents audios, révéler le mot initial et recommencer une nouvelle partie.

## 3. Fonctionnalités requises

### 3.1. Gestion des enregistrements

- Demander l'autorisation d'accéder au microphone.
- Démarrer et arrêter un enregistrement vocal.
- Afficher clairement l'état de l'enregistrement.
- Afficher la durée de l'audio enregistré.
- Permettre de réécouter un enregistrement.
- Permettre de supprimer un enregistrement et de le refaire.
- Préserver l'audio original pendant toute la partie.
- Séparer l'audio original, sa version inversée, l'imitation du joueur 2 et le résultat final.

### 3.2. Inversion audio

L'application doit pouvoir inverser n'importe quel enregistrement vocal valide.

L'inversion doit porter sur les échantillons sonores dans leur ordre temporel inverse, afin que la voix soit réellement lue à l'envers.

L'application ne doit pas utiliser une simple transformation textuelle ou une reconnaissance vocale pour simuler l'inversion.

Chaque inversion doit être réalisée à partir de l'enregistrement correspondant. Le résultat final doit être calculé à partir de l'imitation du joueur 2, et non à partir de l'audio initial.

### 3.3. Lecture audio

Pour chaque enregistrement, l'utilisateur doit pouvoir :

- Lancer la lecture.
- Mettre en pause et reprendre la lecture.
- Réécouter depuis le début.
- Arrêter la lecture.
- Refaire l'enregistrement si nécessaire.

L'application doit empêcher plusieurs lectures simultanées qui pourraient se superposer.

### 3.4. Gestion de la partie

- Démarrer une nouvelle partie.
- Suivre les différentes phases du jeu.
- Afficher le nom du joueur actif.
- Permettre de recommencer une phase sans perdre inutilement les autres enregistrements.
- Révéler le mot original à la fin de la partie.
- Recommencer avec un nouveau mot.
- Réinitialiser toutes les données de la partie lorsque l'utilisateur le demande.

## 4. Interface utilisateur

L'interface doit être moderne, ludique, lisible et facile à utiliser, y compris par des personnes qui découvrent l'application.

### 4.1. Écran d'accueil

L'écran d'accueil contient :

- Le nom et le logo du jeu Reverse Audio.
- Une courte explication des règles.
- Un bouton « Nouvelle partie ».
- Un accès aux instructions du jeu.

### 4.2. Écran principal du jeu

L'écran principal contient :

- Un indicateur de progression : étape 1 sur 4, étape 2 sur 4, etc.
- L'identification du joueur actif.
- Un bouton principal adapté à l'étape en cours.
- Un bouton de lecture ou de réécoute lorsque l'audio est disponible.
- Un bouton pour recommencer l'enregistrement lorsque cela est autorisé.
- Un bouton pour passer à l'étape suivante lorsque les conditions sont remplies.

Les commandes doivent être clairement différenciées. Le bouton principal peut changer de fonction selon la phase, mais son libellé doit toujours indiquer précisément l'action réalisée.

### 4.3. Écran de résultat

L'écran final permet de :

- Écouter l'imitation inversée du joueur 2.
- Réécouter l'audio original.
- Comparer les deux enregistrements.
- Révéler le mot secret.
- Lancer une nouvelle partie.

La comparaison doit être présentée comme un divertissement. L'application ne doit pas affirmer qu'une imitation est correcte sur la seule base de la ressemblance supposée.

## 5. Exigences fonctionnelles détaillées

| Référence | Exigence | Priorité |
|---|---|---|
| RF-01 | Enregistrer la voix du joueur 1 | Essentielle |
| RF-02 | Inverser et lire l'audio original | Essentielle |
| RF-03 | Réécouter l'audio inversé | Essentielle |
| RF-04 | Enregistrer l'imitation du joueur 2 | Essentielle |
| RF-05 | Inverser et lire l'imitation | Essentielle |
| RF-06 | Réécouter les quatre versions audio | Essentielle |
| RF-07 | Révéler l'enregistrement original | Essentielle |
| RF-08 | Recommencer une phase ou une partie | Essentielle |
| RF-09 | Afficher la progression du jeu | Essentielle |
| RF-10 | Exporter ou partager un résultat audio | Facultative |
| RF-11 | Ajouter des catégories de mots ou des défis prédéfinis | Facultative |
| RF-12 | Ajouter un chronomètre ou des règles de score | Facultative |

Les fonctionnalités facultatives ne doivent pas retarder la réalisation du mécanisme audio principal.

## 6. Exigences non fonctionnelles

### 6.1. Compatibilité

L'application doit être utilisable sur :

- Les smartphones Android.
- Les iPhone et iPad.
- Les ordinateurs Windows, macOS et Linux.
- Les navigateurs récents, notamment Chrome, Edge, Firefox et Safari.

L'interface doit s'adapter automatiquement aux différentes tailles d'écran.

### 6.2. Performances

- Le démarrage d'un enregistrement doit être rapide après autorisation du microphone.
- L'inversion d'un court enregistrement doit s'effectuer sans délai perceptible sur les appareils compatibles.
- Les enregistrements courts doivent être lus sans coupures ni superposition sonore.
- L'interface doit rester réactive pendant le traitement audio.
- La durée maximale d'un enregistrement doit être configurable, avec une valeur initiale recommandée de 15 secondes.

### 6.3. Confidentialité

- Aucun compte utilisateur ne doit être nécessaire.
- Aucun enregistrement vocal ne doit être envoyé à un serveur dans la version initiale.
- Les audios doivent être conservés temporairement sur l'appareil pendant la partie.
- Les données audio doivent être supprimées à la fin de la partie ou lors de la réinitialisation, selon le comportement annoncé à l'utilisateur.
- Le microphone ne doit être utilisé qu'après une action explicite de l'utilisateur.

### 6.4. Gestion des erreurs

L'application doit afficher un message compréhensible dans les situations suivantes :

- Permission du microphone refusée.
- Microphone indisponible.
- Enregistrement vide ou trop court.
- Échec de l'enregistrement ou du traitement audio.
- Format audio non pris en charge.
- Interruption de lecture.
- Navigateur incompatible avec une fonctionnalité nécessaire.

Les erreurs doivent proposer une action de récupération lorsque cela est possible.

## 7. Architecture technique recommandée

### 7.1. Choix de la plateforme

**Le choix recommandé est une application web responsive.** Le principe du jeu ne nécessite pas, en lui-même, une application native Flutter.

Les navigateurs modernes disposent de fonctionnalités permettant d'accéder au microphone, d'enregistrer la voix et de traiter des données audio localement.

L'accès au microphone doit être testé dans un contexte sécurisé HTTPS en production, ou sur localhost pendant le développement.

### 7.2. Technologies proposées

- **Frontend :** React avec TypeScript.
- **Interface :** CSS responsive ou une bibliothèque d'interface adaptée aux mobiles.
- **Enregistrement :** MediaRecorder API.
- **Traitement et inversion audio :** Web Audio API.
- **Stockage temporaire :** mémoire de l'application, avec des URL audio temporaires si nécessaire.
- **Backend :** aucun backend nécessaire pour la version initiale.
- **Base de données :** aucune base de données nécessaire pour le jeu local.

Le choix final des formats d'enregistrement doit tenir compte de la compatibilité des navigateurs. L'application doit décoder les données audio, inverser les échantillons du signal et reconstruire un audio lisible.

### 7.3. Conditions de recours à Flutter

Flutter ne sera retenu que si les tests démontrent que les navigateurs ciblés ne permettent pas d'obtenir une expérience suffisamment fiable, notamment concernant l'enregistrement, le traitement audio, les interruptions ou la compatibilité mobile.

Dans ce cas, l'application pourra être développée en Flutter avec les fonctionnalités natives d'enregistrement et de traitement audio, tout en conservant les mêmes règles de jeu et exigences fonctionnelles.

## 8. Parcours utilisateur attendu

Le parcours nominal est le suivant :

1. L'utilisateur ouvre l'application.
2. Il lance une nouvelle partie.
3. Le joueur 1 enregistre un mot ou une phrase.
4. Le joueur 2 écoute la version inversée.
5. Le joueur 2 réécoute si nécessaire.
6. Le joueur 2 enregistre son imitation.
7. L'application inverse cette imitation.
8. Les joueurs écoutent le résultat.
9. Le mot initial est révélé.
10. Les joueurs peuvent recommencer.

Chaque étape doit être clairement identifiable. Une action ne doit pas être proposée avant que les données nécessaires soient disponibles.

## 9. Tests et critères de validation

La première version sera considérée comme acceptable lorsque les tests suivants seront validés :

- **Test 1 :** l'utilisateur peut enregistrer sa voix et la réécouter.
- **Test 2 :** l'inversion produit réellement un audio lu dans l'ordre temporel inverse.
- **Test 3 :** l'audio inversé peut être lu plusieurs fois.
- **Test 4 :** le joueur 2 peut enregistrer son imitation indépendamment de l'audio original.
- **Test 5 :** l'inversion de l'imitation produit un nouvel audio distinct, issu de cette imitation.
- **Test 6 :** l'audio original reste disponible jusqu'à la révélation du mot.
- **Test 7 :** les erreurs de permission et les enregistrements invalides sont gérés proprement.
- **Test 8 :** le jeu fonctionne sur un ordinateur et sur un smartphone Android.
- **Test 9 :** les tests sur iPhone et Safari confirment la compatibilité avant d'annoncer un support complet.
- **Test 10 :** aucune voix n'est transmise à un serveur dans la version initiale.

La validation doit porter sur le bon fonctionnement du mécanisme, et non sur l'obligation d'obtenir un résultat final identique à l'audio original. Une imitation imparfaite est un comportement normal du jeu.

## 10. Périmètre de la première version (MVP)

La première version doit se limiter aux fonctionnalités indispensables :

- Un seul appareil partagé par deux joueurs.
- Enregistrement du mot secret.
- Inversion de l'audio original.
- Écoute et réécoute.
- Enregistrement de l'imitation.
- Inversion de l'imitation.
- Écoute du résultat et révélation du mot secret.
- Recommencement d'une partie.
- Interface responsive.
- Traitement audio local et gestion des erreurs.

Ne sont pas nécessaires pour cette version : authentification, comptes, multijoueur en ligne, classement, base de données, intelligence artificielle, reconnaissance automatique de la parole, système de points complexe ou hébergement de fichiers audio.

## 11. Évolutions futures possibles

Après validation du MVP, les évolutions suivantes pourront être envisagées :

- Mode avec chronomètre.
- Système de score défini par les joueurs.
- Catégories de défis : personnages, films, marques, expressions, etc.
- Bibliothèque de sons prédéfinis.
- Export et partage d'extraits audio.
- Mode multijoueur en ligne.
- Historique local des parties.
- Installation comme application web progressive (PWA).

Ces évolutions restent hors du périmètre initial.

## 12. Livrables attendus

- Application web fonctionnelle et responsive.
- Interface de jeu complète.
- Fonctionnalités d'enregistrement, d'inversion et de lecture audio.
- Gestion des erreurs et des permissions du microphone.
- Tests fonctionnels sur les appareils et navigateurs ciblés.
- Documentation d'installation et de lancement.
- Documentation concise du fonctionnement audio.
- Instructions de déploiement sur un hébergement HTTPS.

## 13. Conclusion

Reverse Audio doit être développé en priorité comme une application web responsive, avec un traitement audio local et sans infrastructure backend dans le MVP.

La réussite du projet dépend principalement de la fiabilité des enregistrements et de l'inversion réelle du signal sonore. L'architecture doit rester simple, avec une séparation claire entre l'audio original, son inversion, l'imitation et le résultat final.

Le développement devra commencer par un prototype validant l'enregistrement, l'inversion et la lecture sur ordinateur et smartphone. Une fois ce mécanisme validé, l'interface complète du jeu pourra être réalisée sur cette base.