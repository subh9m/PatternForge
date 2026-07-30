import React, { useState } from 'react';
import { Search, Copy, Check, Filter, Code, BookOpen } from 'lucide-react';

const SPRING_GLOSSARY_ITEMS = [
  {
    term: "@Component",
    category: "CORE",
    definition: "Marks a Java class as a generic Spring-managed bean candidate for autowiring scanning.",
    analogy: "A registered contractor license: it lets the company know this entity is available for hire in the registry.",
    oneLiner: "@Component registers a generic bean in the Spring container, serving as the parent of other stereotypes."
  },
  {
    term: "@Service",
    category: "CORE",
    definition: "A semantic specialization of @Component, marking the class as a business logic layer component.",
    analogy: "The head chef in a restaurant: does not deal with clients or buy groceries directly, but runs the recipe instructions.",
    oneLiner: "@Service designates business logic execution layer classes in the ApplicationContext."
  },
  {
    term: "@Repository",
    category: "DATA",
    definition: "Stereotype specialization for the DAO/Persistence layer that automatically translates database exceptions.",
    analogy: "A bilingual translator in a foreign port: converts raw local port issues into standard expressions the ship crew understands.",
    oneLiner: "@Repository registers persistence classes and translates JDBC/SQL exceptions to Spring's DataAccessException."
  },
  {
    term: "@RestController",
    category: "WEB",
    definition: "Combines @Controller and @ResponseBody, serializing returned objects directly to JSON or XML response streams.",
    analogy: "A drive-thru speaker box: you order and receive food directly on the spot, without going inside to sit at a table.",
    oneLiner: "@RestController bypasses ViewResolvers to write JSON directly to the client response pipeline."
  },
  {
    term: "@Transactional",
    category: "DATA",
    definition: "Enables declarative transaction boundaries on classes/methods, ensuring atomicity via Spring AOP proxies.",
    analogy: "A bank wire agreement: either the transfer happens completely or both accounts revert back to their starting balance.",
    oneLiner: "@Transactional wraps database queries in ACID transaction boundaries, rolling back on RuntimeExceptions."
  },
  {
    term: "@Async",
    category: "SYSTEMS",
    definition: "Instructs the container to run the target method asynchronously on a separate managed thread pool.",
    analogy: "Handing tasks to a helper assistant: you continue writing code while they run to the post office to mail letters.",
    oneLiner: "@Async delegates task execution to a background ThreadPoolTaskExecutor, returning Future or void."
  },
  {
    term: "@Cacheable",
    category: "SYSTEMS",
    definition: "Caches the return value of a method execution; subsequent calls with identical arguments skip method runs.",
    analogy: "A student writing answers on a scratchpad: if the teacher asks the exact same question, they read the scratchpad directly.",
    oneLiner: "@Cacheable avoids slow method calculations by loading results from cache storage if parameters match."
  },
  {
    term: "@Qualifier",
    category: "CORE",
    definition: "Resolves bean injection ambiguity when multiple candidates of the same type exist in the context.",
    analogy: "Calling a friend by their nickname: if two friends are named John, you call for 'John the Builder' to specify.",
    oneLiner: "@Qualifier specifies the exact bean name to inject when type matching returns multiple candidates."
  }
];

const SPRING_SNIPPETS = [
  {
    name: "Global Exception Handler",
    desc: "Centralized controller advice class translation of database/runtime exceptions.",
    code: `package com.patternforge.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleNotFound(ResourceNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getMessage());
        body.put("status", HttpStatus.NOT_FOUND.value());

        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }
}`
  },
  {
    name: "Spring Security 6 Config",
    desc: "Configuration filtering routing requests without deprecated WebSecurityConfigurerAdapter.",
    code: `package com.patternforge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            );
        return http.build();
    }
}`
  },
  {
    name: "Async ThreadPool Config",
    desc: "Custom ThreadPoolTaskExecutor properties setup for managed @Async method delegates.",
    code: `package com.patternforge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("AsyncThread-");
        executor.initialize();
        return executor;
    }
}`
  },
  {
    name: "JPA Custom query Specs",
    desc: "Advanced Specification queries to filter products criteria dynamically.",
    code: `package com.patternforge.repository;

import com.patternforge.model.Product;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecifications {

    public static Specification<Product> hasCategory(String category) {
        return (root, query, cb) -> cb.equal(root.get("category"), category);
    }

    public static Specification<Product> priceLessThan(Double price) {
        return (root, query, cb) -> cb.lessThan(root.get("price"), price);
    }
}`
  }
];

export default function SpringCheatSheet() {
  const [viewMode, setViewMode] = useState('glossary'); // 'glossary' or 'snippets'
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeSnippetIdx, setActiveSnippetIdx] = useState(0);

  const categories = ['ALL', 'CORE', 'WEB', 'DATA', 'SYSTEMS'];

  const filtered = SPRING_GLOSSARY_ITEMS.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(search.toLowerCase()) || 
                          item.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'ALL' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
      
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
            📋 Spring Cheat Sheets & Boilerplates
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-light leading-relaxed">
            Quick-lookup annotation details and copy-paste boilerplate config blocks for senior backend interviews.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-gray-100 dark:bg-neutral-900 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
          <button
            onClick={() => setViewMode('glossary')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer
              ${viewMode === 'glossary' 
                ? 'bg-green-600 text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Glossary</span>
          </button>
          <button
            onClick={() => setViewMode('snippets')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer
              ${viewMode === 'snippets' 
                ? 'bg-green-600 text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            <Code className="h-3.5 w-3.5" />
            <span>Code Snippets</span>
          </button>
        </div>
      </div>

      {viewMode === 'glossary' ? (
        <>
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search annotations or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-gray-55/50 dark:bg-black/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl font-mono text-neutral-800 dark:text-neutral-300 focus:outline-none focus:border-green-500 transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <Filter className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mr-1" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg border transition-all cursor-pointer
                    ${category === cat 
                      ? 'bg-green-500/10 text-green-500 border-green-500/30' 
                      : 'bg-transparent text-gray-500 dark:text-gray-400 border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 hover:border-green-500/20'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-5 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 bg-white/40 dark:bg-neutral-950/20 hover:border-green-500/30 rounded-xl flex flex-col justify-between space-y-4 hover:shadow-md transition-all group relative"
                >
                  {/* Top Row */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-mono font-black uppercase rounded">
                        {item.category}
                      </span>
                      <button
                        onClick={() => handleCopy(`${item.term}: ${item.definition}`, idx)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-900 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all opacity-0 group-hover:opacity-100 absolute right-3 top-3 animate-fadeIn"
                        title="Copy definition"
                      >
                        {copiedIndex === idx ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <h3 className="text-sm font-black text-neutral-800 dark:text-neutral-200 font-mono">
                      {item.term}
                    </h3>
                  </div>

                  {/* Definition */}
                  <p className="text-[14px] md:text-[15px] text-gray-700 dark:text-neutral-300 font-normal leading-relaxed">
                    {item.definition}
                  </p>

                  {/* Analogy Box */}
                  <div className="p-4 bg-neutral-100/60 dark:bg-neutral-900/30 border-l-2 border-slate-400 dark:border-neutral-700 rounded-r-lg">
                    <span className="block text-[9.5px] font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-widest font-black mb-1">💡 SDE Analogy</span>
                    <p className="text-[13px] md:text-[14px] italic text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
                      {item.analogy}
                    </p>
                  </div>

                  {/* Speak-ready summary */}
                  <div className="space-y-0.5">
                    <span className="block text-[9.5px] font-mono text-green-500/80 uppercase tracking-widest font-black">🗣️ Speak-ready Answer</span>
                    <p className="text-[13px] md:text-[14px] font-mono font-bold text-green-500/90 leading-relaxed">
                      {item.oneLiner}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-10 border border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl text-center text-gray-400">
                <span className="text-2xl">🔎</span>
                <span className="text-xs font-mono mt-2">No matching items found.</span>
              </div>
            )}
          </div>
        </>
      ) : (
        /* CODE BOILERPLATES VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
          {/* Sidebar selector */}
          <div className="lg:col-span-1 space-y-2.5">
            {SPRING_SNIPPETS.map((snip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveSnippetIdx(idx);
                  setCopiedIndex(null);
                }}
                className={`w-full p-4 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between space-y-1
                  ${activeSnippetIdx === idx 
                    ? 'border-green-500/30 bg-green-500/5 text-green-500 shadow-md shadow-green-500/5' 
                    : 'border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 hover:border-green-500/10 text-neutral-700 dark:text-neutral-300'}`}
              >
                <strong className="text-[11px] font-black">{snip.name}</strong>
                <span className="text-[9.5px] text-gray-400 dark:text-gray-500 font-light leading-normal">{snip.desc}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer Panel */}
          <div className="lg:col-span-2 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 bg-neutral-950/70 rounded-xl p-5 flex flex-col justify-between min-h-[300px] relative">
            <div className="absolute right-4 top-4 z-10">
              <button
                onClick={() => handleCopy(SPRING_SNIPPETS[activeSnippetIdx].code, activeSnippetIdx)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/25 text-green-500 border border-green-500/20 rounded-lg text-[10px] font-black cursor-pointer transition-colors"
              >
                {copiedIndex === activeSnippetIdx ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            <div className="overflow-x-auto pt-8 select-all">
              <pre className="text-[10px] text-green-400 font-mono leading-normal whitespace-pre">
                {SPRING_SNIPPETS[activeSnippetIdx].code}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
