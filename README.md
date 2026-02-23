# Mini Chat App – MCP Agent

Dieses Projekt implementiert ein leichtgewichtiges agentisches System mit dem **Model Context Protocol (MCP)**.  

Das System nimmt ein übergeordnetes Ziel (Goal) vom Benutzer entgegen, zerlegt es in mehrere Schritte, ruft geeignete MCP-Tools auf und erzeugt anschließend eine konsistente, strukturierte Endausgabe.

## Architekturüberblick

Die Anwendung basiert auf einer klar getrennten **Plan → Execute → Synthesize** Architektur.

### 1 Planner (`planner.ts`)
Der Planner:
- analysiert das High-Level-Ziel,
- erzeugt strukturierte `AgentStep`s,
- entscheidet, welche Tools aufgerufen werden sollen,
- definiert Zwischenspeicher (`saveAs`), um Ergebnisse weiterzuverwerten.

### 2 TaskRunner (`TaskRunner.ts`)
Der TaskRunner:
- implementiert die Agent-Loop,
- ruft MCP-Tools Schritt für Schritt auf,
- speichert Zwischenergebnisse in `artifacts`,
- rendert die finale Ausgabe anhand eines Templates.

### 3 MCP-Tools
Integrierte Tools:

- `filesystem.read_file` – liest lokale Dateien
- `utility.extract_todos` – extrahiert TODO-Einträge aus Text
- `utility.uppercase` – konvertiert Text in Großbuchstaben
- `utility.fetch_url` – lädt Webinhalte


## Agent Loop

Der Ablauf des Systems:


```
Goal → plan() → steps[]

für jeden Schritt:
  wenn tool:
    MCP-Tool aufrufen
    Ergebnis speichern
  wenn final:
    stoppen
```


Diese Struktur ermöglicht:
- mehrstufige Tool-Orchestrierung
- Nutzung von Zwischenergebnissen
- saubere Trennung von Planung und Ausführung

## Beispiel

**Eingabe:**

Generate a weekly planning summary based on my notes



Der Agent wird:

1. `notes.txt` lesen  
2. TODO-Einträge extrahieren  
3. Eine strukturierte Wochenübersicht generieren  



## Anwendung starten

Abhängigkeiten installieren:

```bash
npm install
```
CLI starten:

```bash
npm run dev
```
Tests ausführen:
```bash
npm test
```
## Testing

Das Projekt enthält sinnvolle Tests für die Planungslogik.

Getestet werden unter anderem:

- korrekte Multi-Step-Planung
- Tool-Routing
- Verzweigungslogik
- Template-Platzhalter (`{{notes}}`, `{{todos}}`)


## Design-Entscheidungen

Diese agentische Architektur ist bewusst gewählt, da komplexe Aufgaben oft nicht mit einem einzelnen Funktionsaufruf lösbar sind.  
Durch die Aufteilung in Planung und Ausführung kann das System mehrstufige Workflows abbilden, Zwischenergebnisse wiederverwenden und flexibel erweitert werden.

Ich habe bewusst eine Trennung zwischen Planung (Planner) und Ausführung (TaskRunner) gewählt, um:

- Reasoning und Execution klar zu trennen
- Testbarkeit zu verbessern
- Erweiterbarkeit durch neue Tools zu ermöglichen
- die Agent-Logik nachvollziehbar zu strukturieren

Zwischenergebnisse werden mithilfe von `saveAs` gespeichert, sodass spätere Schritte auf vorherige Tool-Outputs zugreifen können.


## Technische Highlights

- TypeScript mit klaren Union Types
- Strukturierte Agent-Loop
- MCP-Integration über stdio
- Saubere Separation of Concerns
- Automatisierte Tests mit Vitest


## Mögliche Erweiterungen (Future Work)

Mit mehr Zeit würde ich das System in Richtung eines stärker „agentischen“ Setups weiterentwickeln:

- **LLM-basierte Planung (Dynamic Planning):**  
  Den rule-based Planner durch ein LLM ersetzen, das aus einem Goal einen strukturierten Plan (z. B. JSON) erzeugt.  
  Dadurch kann der Agent flexibler auf unterschiedliche Aufgaben reagieren.

- **Reflexions-/Validierungsschritt (Reflection):**  
  Nach jedem Tool-Call die Zwischenergebnisse vom LLM bewerten lassen (z. B. „ist das Ergebnis plausibel?“) und bei Bedarf den Plan anpassen oder einen Retry durchführen.

- **Tool Auto-Discovery via MCP `listTools`:**  
  Tools nicht hardcoden, sondern zur Laufzeit über MCP entdecken und dem Planner als verfügbare Fähigkeiten bereitstellen.

- **Robustere Fehlerbehandlung & Retries:**  
  Einheitliche Error-Handling-Strategie (Timeouts, Retries, Fallback-Plan) um die Ausführung stabiler zu machen.

- **Persistente Memory/Artifacts:**  
  Artifacts und Run-History dauerhaft speichern (z. B. JSON/SQLite), sodass der Agent über mehrere Sessions hinweg Kontext behalten kann.

- **Strukturiertes Output-Format:**  
  Ergebnisse zunächst als strukturiertes JSON erzeugen und anschließend sauber rendern (CLI oder UI), um Formatierungsfehler zu reduzieren und die Ausgaben weiterverarbeitbar zu machen.

- **Optional: UI statt CLI:**  
  Eine kleine Web-UI (z. B. React) oder eine TUI, um Goals, Steps und Zwischenergebnisse transparenter darzustellen.