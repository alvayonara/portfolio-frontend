<script lang="ts">
	import type { PageData } from './$types';
	import { onMount, tick } from 'svelte';
	import { API_BASE_URL, S3_BASE_URL } from '$lib/env';

	export let data: PageData;

	let activeFilter = '*';
	let contactStatus: 'idle' | 'submitting' | 'success' | 'error' = 'idle';
	let errorMessage = '';

	function filterProjects(filter: string) {
		activeFilter = filter;
	}

	async function handleContactSubmit(event: SubmitEvent) {
		event.preventDefault();
		contactStatus = 'submitting';
		errorMessage = '';

		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		const company = formData.get('company')?.toString() || '';
		if (company) {
			return;
		}

		try {
			const response = await fetch(`${API_BASE_URL}/contact`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: formData.get('name'),
					email: formData.get('email'),
					subject: formData.get('subject'),
					message: formData.get('message')
				}),
			});

			if (response.ok) {
				contactStatus = 'success';
				form.reset();
			} else {
				const errorText = await response.text().catch(() => 'Failed to send message');
				contactStatus = 'error';
				errorMessage = errorText;
			}
		} catch (error) {
			contactStatus = 'error';
			errorMessage = 'Failed to send message. Please try again.';
			console.error('Contact form error:', error);
		}
	}

	$: filteredProjects = data.projects || [];
	
	$: if (filteredProjects && typeof window !== 'undefined') {
		tick().then(() => {
			initializeProjectPopups();
		});
	}

	function getProjectImageUrl(s3Key: string | null): string | null {
		if (!s3Key) return null;
		return `${S3_BASE_URL}/${s3Key}`;
	}

	function getProjectThumbnailUrl(project: any): string | null {
		const key = project.thumbnailS3Key || project.s3Key;
		return key ? `${S3_BASE_URL}/${key}` : null;
	}

	function initializeProjectPopups() {
		const $ = globalThis.$;
		if ($) {
			const $workContent = $('.work-content');
			if ($workContent.length > 0) {
				$workContent.each(function() {
					const $this = $(this);
					if ($this.data('magnificPopup')) {
						$this.magnificPopup('destroy');
					}
				});
				
				$workContent.magnificPopup({
					type: 'inline',
					fixedContentPos: true,
					fixedBgPos: true,
					overflowY: 'auto',
					closeBtnInside: true,
					preloader: false,
					midClick: true,
					removalDelay: 300,
					mainClass: 'my-mfp-zoom-in'
				});
			}
		}
	}

	onMount(() => {
		const preloader = document.getElementById('preloader');
		if (preloader) {
			setTimeout(() => {
				preloader.style.opacity = '0';
				setTimeout(() => {
					preloader.style.display = 'none';
				}, 300);
			}, 100);
		}

		const $ = globalThis.$;
		if ($) {
			$('.spacer').each(function() {
				const height = $(this).data('height');
				if (height) {
					$(this).css('height', height + 'px');
				}
			});

			initializeProjectPopups();
		}

		if (typeof window !== 'undefined') {
			if (window.WOW) {
				new window.WOW().init();
			}
			if (window.Morphext && document.querySelector('.text-rotating')) {
				const $ = globalThis.$;
				if ($) {
					$('.text-rotating').Morphext({
						animation: 'fadeIn',
						separator: ',',
						speed: 2000
					});
				}
			}
			if (window.Parallax && document.querySelector('.parallax')) {
				const scene = document.querySelector('.parallax');
				const parallaxInstance = new Parallax(scene);
			}
		}

		const sections = document.querySelectorAll('section[id]');
		const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
		
		navLinks.forEach(link => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const targetId = link.getAttribute('href');
				if (targetId && targetId.startsWith('#')) {
					const targetSection = document.querySelector(targetId);
					if (targetSection) {
						targetSection.scrollIntoView({
							behavior: 'smooth',
							block: 'start'
						});
					}
				}
			});
		});
		
		window.addEventListener('scroll', () => {
			let current = '';
			sections.forEach(section => {
				const sectionTop = (section as HTMLElement).offsetTop;
				const sectionHeight = (section as HTMLElement).clientHeight;
				if (window.pageYOffset >= sectionTop - 200) {
					current = section.getAttribute('id') || '';
				}
			});

			navLinks.forEach(link => {
				link.classList.remove('active');
				if (link.getAttribute('href') === `#${current}`) {
					link.classList.add('active');
				}
			});
		});
	});
</script>

<svelte:head>
	<title>{data.profile?.fullName || 'Portfolio'}</title>
	<meta name="description" content={data.profile?.bio || 'Portfolio Website'}>
</svelte:head>

<div id="preloader">
	<div class="outer">
		<div class="infinityChrome">
			<div></div>
			<div></div>
			<div></div>
		</div>
		<div class="infinity">
			<div><span></span></div>
			<div><span></span></div>
			<div><span></span></div>
		</div>
	</div>
</div>

<header class="desktop-header-3 fixed-top">
	<div class="container">
		<nav class="navbar navbar-expand-lg navbar-dark">
			<button 
				class="navbar-toggler" 
				type="button" 
				data-toggle="collapse" 
				data-target="#navbarNav"
			>
				<span class="navbar-toggler-icon"></span>
			</button>
			<div class="collapse navbar-collapse" id="navbarNav">
				<ul class="navbar-nav ml-auto">
					<li class="nav-item"><a class="nav-link" href="#home">Home</a></li>
					<li class="nav-item"><a class="nav-link" href="#about">About</a></li>
					<li class="nav-item"><a class="nav-link" href="#experience">Experience</a></li>
					<li class="nav-item"><a class="nav-link" href="#works">Works</a></li>
					<li class="nav-item"><a class="nav-link" href="#contact">Contact</a></li>
				</ul>
			</div>
		</nav>
	</div>
</header>

<main class="content-3">
	<section id="home" class="home d-flex align-items-center">
		<div class="container">
			<div class="intro">
				{#if data.profile?.s3Key}
					<img 
						src={`${S3_BASE_URL}/profile/${data.profile.s3Key}`} 
						width="108" 
						height="108" 
						alt="{data.profile.fullName} | Profile" 
						class="mb-4 profile-img" 
					/>
				{:else}
					<div class="profile-img-placeholder mb-4">
						<i class="fas fa-user"></i>
					</div>
				{/if}

				<h1 class="mb-2 mt-0">{data.profile?.fullName || 'Alva Yonara Puramandya'}</h1>
				<span><span class="text-rotating">{data.profile?.headline || 'Software Engineer'}</span></span>

				<ul class="social-icons light list-inline mb-0 mt-4">
					{#if data.profile?.linkedinUrl}
						<li class="list-inline-item">
							<a href={data.profile.linkedinUrl} target="_blank" rel="noopener">
								<i class="fab fa-linkedin"></i>
							</a>
						</li>
					{/if}
					{#if data.profile?.githubUrl}
						<li class="list-inline-item">
							<a href={data.profile.githubUrl} target="_blank" rel="noopener">
								<i class="fab fa-github"></i>
							</a>
						</li>
					{/if}
				</ul>

				<div class="mt-4">
					<a href="#contact" class="btn btn-default">Contact Me</a>
				</div>
			</div>

			<div class="scroll-down">
				<a href="#about" class="mouse-wrapper">
					<span>Scroll Down</span>
					<span class="mouse">
						<span class="wheel"></span>
					</span>
				</a>
			</div>

			<div class="parallax" data-relative-input="true">
				<svg width="27" height="29" data-depth="0.3" class="layer p1" xmlns="http://www.w3.org/2000/svg"><path d="M21.15625.60099c4.37954 3.67487 6.46544 9.40612 5.47254 15.03526-.9929 5.62915-4.91339 10.30141-10.2846 12.25672-5.37122 1.9553-11.3776.89631-15.75715-2.77856l2.05692-2.45134c3.50315 2.93948 8.3087 3.78663 12.60572 2.22284 4.297-1.5638 7.43381-5.30209 8.22768-9.80537.79387-4.50328-.8749-9.08872-4.37803-12.02821L21.15625.60099z" fill="#FFD15C" fill-rule="evenodd"/></svg>
				<svg width="26" height="26" data-depth="0.2" class="layer p2" xmlns="http://www.w3.org/2000/svg"><path d="M13 3.3541L2.42705 24.5h21.1459L13 3.3541z" stroke="#FF4C60" stroke-width="3" fill="none" fill-rule="evenodd"/></svg>
				<svg width="30" height="25" data-depth="0.3" class="layer p3" xmlns="http://www.w3.org/2000/svg"><path d="M.1436 8.9282C3.00213 3.97706 8.2841.92763 14.00013.92796c5.71605.00032 10.9981 3.04992 13.85641 8 2.8583 4.95007 2.8584 11.0491-.00014 16.00024l-2.77128-1.6c2.28651-3.96036 2.28631-8.84002.00011-12.8002-2.2862-3.96017-6.5124-6.40017-11.08513-6.4-4.57271.00018-8.79872 2.43984-11.08524 6.4002l-2.77128-1.6z" fill="#44D7B6" fill-rule="evenodd"/></svg>
				<svg width="15" height="23" data-depth="0.6" class="layer p4" xmlns="http://www.w3.org/2000/svg"><rect transform="rotate(30 9.86603 10.13397)" x="7" width="3" height="25" rx="1.5" fill="#FFD15C" fill-rule="evenodd"/></svg>
				<svg width="15" height="23" data-depth="0.2" class="layer p5" xmlns="http://www.w3.org/2000/svg"><rect transform="rotate(30 9.86603 10.13397)" x="7" width="3" height="25" rx="1.5" fill="#6C6CE5" fill-rule="evenodd"/></svg>
				<svg width="49" height="17" data-depth="0.5" class="layer p6" xmlns="http://www.w3.org/2000/svg"><g fill="#FF4C60" fill-rule="evenodd"><path d="M.5 16.5c0-5.71709 2.3825-10.99895 6.25-13.8567 3.8675-2.85774 8.6325-2.85774 12.5 0C23.1175 5.50106 25.5 10.78292 25.5 16.5H23c0-4.57303-1.90625-8.79884-5-11.08535-3.09375-2.28652-6.90625-2.28652-10 0C4.90625 7.70116 3 11.92697 3 16.5H.5z"/><path d="M23.5 16.5c0-5.71709 2.3825-10.99895 6.25-13.8567 3.8675-2.85774 8.6325-2.85774 12.5 0C46.1175 5.50106 48.5 10.78292 48.5 16.5H46c0-4.57303-1.90625-8.79884-5-11.08535-3.09375-2.28652-6.90625-2.28652-10 0-3.09375 2.28651-5 6.51232-5 11.08535h-2.5z"/></g></svg>
				<svg width="26" height="26" data-depth="0.4" class="layer p7" xmlns="http://www.w3.org/2000/svg"><path d="M13 22.6459L2.42705 1.5h21.1459L13 22.6459z" stroke="#FFD15C" stroke-width="3" fill="none" fill-rule="evenodd"/></svg>
				<svg width="19" height="21" data-depth="0.3" class="layer p8" xmlns="http://www.w3.org/2000/svg"><rect transform="rotate(-40 6.25252 10.12626)" x="7" width="3" height="25" rx="1.5" fill="#6C6CE5" fill-rule="evenodd"/></svg>
				<svg width="30" height="25" data-depth="0.3" data-depth-y="-1.30" class="layer p9" xmlns="http://www.w3.org/2000/svg"><path d="M29.8564 16.0718c-2.85854 4.95114-8.1405 8.00057-13.85654 8.00024-5.71605-.00032-10.9981-3.04992-13.85641-8-2.8583-4.95007-2.8584-11.0491.00014-16.00024l2.77128 1.6c-2.28651 3.96036-2.28631 8.84002-.00011 12.8002 2.2862 3.96017 6.5124 6.40017 11.08513 6.4 4.57271-.00018 8.79872-2.43984 11.08524-6.4002l2.77128 1.6z" fill="#6C6CE5" fill-rule="evenodd"/></svg>
				<svg width="47" height="29" data-depth="0.2" class="layer p10" xmlns="http://www.w3.org/2000/svg"><g fill="#44D7B6" fill-rule="evenodd"><path d="M46.78878 17.19094c-1.95535 5.3723-6.00068 9.52077-10.61234 10.8834-4.61167 1.36265-9.0893-.26708-11.74616-4.27524-2.65686-4.00817-3.08917-9.78636-1.13381-15.15866l2.34923.85505c-1.56407 4.29724-1.2181 8.92018.90705 12.12693 2.12514 3.20674 5.70772 4.5107 9.39692 3.4202 3.68921-1.0905 6.92581-4.40949 8.48988-8.70673l2.34923.85505z"/><path d="M25.17585 9.32448c-1.95535 5.3723-6.00068 9.52077-10.61234 10.8834-4.61167 1.36264-9.0893-.26708-11.74616-4.27525C.16049 11.92447-.27182 6.14628 1.68354.77398l2.34923.85505c-1.56407 4.29724-1.2181 8.92018.90705 12.12692 2.12514 3.20675 5.70772 4.5107 9.39692 3.4202 3.68921-1.0905 6.92581-4.40948 8.48988-8.70672l2.34923.85505z"/></g></svg>
				<svg width="33" height="20" data-depth="0.5" class="layer p11" xmlns="http://www.w3.org/2000/svg"><path d="M32.36774.34317c.99276 5.63023-1.09332 11.3614-5.47227 15.03536-4.37895 3.67396-10.3855 4.73307-15.75693 2.77837C5.76711 16.2022 1.84665 11.53014.8539 5.8999l3.15139-.55567c.7941 4.50356 3.93083 8.24147 8.22772 9.8056 4.29688 1.56413 9.10275.71673 12.60554-2.2227C28.34133 9.98771 30.01045 5.4024 29.21635.89884l3.15139-.55567z" fill="#FFD15C" fill-rule="evenodd"/></svg>
			</div>
		</div>
	</section>

	<section id="about">
		<div class="container">
			<h2 class="section-title wow fadeInUp">About Me</h2>
			<div class="spacer" data-height="60"></div>
			
			<div class="row">
				<div class="col-md-3">
					<div class="text-center text-md-left">
						{#if data.profile?.s3Key}
							<img 
								src={`${S3_BASE_URL}/profile/${data.profile.s3Key}`} 
								width="150" 
								height="150" 
								alt="{data.profile.fullName} | Profile" 
								class="profile-img"
							/>
						{:else}
							<div class="profile-img-placeholder" style="width: 150px; height: 150px; font-size: 50px;">
								<i class="fas fa-user"></i>
							</div>
						{/if}
					</div>
					<div class="spacer d-md-none d-lg-none" data-height="30"></div>
				</div>

				<div class="col-md-9 triangle-left-md triangle-top-sm">
					<div class="rounded bg-white shadow-dark padding-30">
						<div class="row">
							<div class="col-md-12">
								{#if data.profile?.summary}
									<p class="profile-summary">{data.profile.summary}</p>
								{/if}
								
								{#if data.resume?.url}
									<div class="mt-3">
										<a 
											href={data.resume.url} 
											class="btn btn-default" 
											download
											target="_blank"
											rel="noopener noreferrer"
										>
											Download CV
										</a>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section id="experience">
		<div class="container">
			<h2 class="section-title wow fadeInUp">Experience & Education</h2>
			<div class="spacer" data-height="60"></div>
			
			<div class="row">
				<div class="col-md-6">
					<div class="timeline exp bg-white rounded shadow-dark padding-30 overflow-hidden">
						{#each (data.experiences || []) as exp}
							<div class="timeline-container wow fadeInUp">
								<div class="content">
									<span class="time">
										{exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
										- 
										{exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
									</span>
									<h3 class="title">{exp.title}</h3>
									<span class="time"><b>{exp.company}</b></span>
									{#if exp.description}
									<ul class="experience-list">
										{#each exp.description.split(/\r?\n/).filter(line => line.trim()) as line}
											<li>{line}</li>
										{/each}
									</ul>
									{/if}
								</div>
							</div>
						{/each}
						<span class="line"></span>
					</div>
				</div>

				<div class="col-md-6">
					<div class="spacer d-md-none d-lg-none" data-height="30"></div>
					<div class="timeline edu bg-white rounded shadow-dark padding-30 overflow-hidden">
						{#each (data.educations || []) as edu}
							<div class="timeline-container wow fadeInUp">
								<div class="content">
									<span class="time">
									{edu.startYear || ''} - {edu.endYear || 'Present'}
									</span>
									<h3 class="title">{edu.degree}</h3>
									<span class="time"><b>{edu.institutionName}</b></span>								{#if edu.fieldOfStudy}
									<span class="time"> • {edu.fieldOfStudy}</span>
								{/if}									{#if edu.description}
									<ul class="experience-list">
										{#each edu.description.split(/\r?\n/).filter(line => line.trim()) as line}
											<li>{line}</li>
										{/each}
									</ul>
									{/if}
								</div>
							</div>
						{/each}
						<span class="line"></span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section id="works">
		<div class="container">
			<h2 class="section-title wow fadeInUp">Recent Works</h2>

			<div class="spacer" data-height="60"></div>
			
			<div class="row portfolio-wrapper">
				{#if filteredProjects.length === 0}
					<div class="col-12">
						<p class="text-center">No projects to display yet.</p>
					</div>
				{:else}
					{#each filteredProjects as project}
						<div class="col-md-4 col-sm-6 grid-item">
							<a href="#small-dialog-{project.id}" class="work-content">
								<div class="portfolio-item rounded shadow-dark">
									<div class="details">
										<span class="term">Project</span>
										<h4 class="title">{project.title}</h4>
										<span class="more-button"><i class="icon-options"></i></span>
									</div>
									<div class="thumb">
									{#if project.thumbnailS3Key || project.s3Key}
									<img src={getProjectThumbnailUrl(project)} alt={project.title} />
										{:else}
										<div class="placeholder-thumb"></div>
										{/if}
										<div class="mask"></div>
									</div>
								</div>
							</a>
							<div id="small-dialog-{project.id}" class="white-popup zoom-anim-dialog mfp-hide">
								{#if project.s3Key}
									<img class="rounded" src={getProjectImageUrl(project.s3Key)} alt={project.title} />
								{:else}
									<div class="placeholder-thumb rounded mb-3"></div>
								{/if}
								<h2>{project.title}</h2>
								{#if project.description}
									<p>{@html project.description}</p>
								{/if}
								{#if project.techStack}
									<p><strong>Tech stack:</strong> {project.techStack}</p>
								{/if}
								{#if project.repoUrl}
									<a href={project.repoUrl} class="btn btn-default" target="_blank" rel="noopener">View on GitHub</a>
								{/if}
							</div>
						</div>
					{/each}
				{/if}
			</div>

		</div>

	</section>

	<section id="contact">
		<div class="container">
			<h2 class="section-title wow fadeInUp">Get In Touch</h2>
			<div class="spacer" data-height="60"></div>
			
			<div class="row">
				<div class="col-md-4">
					<div class="contact-info">
						<h3>Let's talk about everything!</h3>
						<p>
							Don't like forms? Send me an 
							<a href="mailto:{data.profile?.email || 'email@example.com'}">email</a>. 👋
						</p>
					</div>
				</div>

				<div class="col-md-8">
					{#if contactStatus === 'success'}
						<div class="alert alert-success">
							Thank you! Your message has been sent successfully.
						</div>
					{/if}
					
					{#if contactStatus === 'error'}
						<div class="alert alert-danger">
							{errorMessage || 'Failed to send message. Please try again.'}
						</div>
					{/if}

					<form class="contact-form mt-6" on:submit={handleContactSubmit}>
						<div class="row">
							<div class="column col-md-6">
								<div class="form-group">
									<input 
										type="text" 
										class="form-control" 
										name="name" 
										placeholder="Your name" 
										required 
										disabled={contactStatus === 'submitting'}
									/>
								</div>
							</div>
							
							<div class="column col-md-6">
								<div class="form-group">
									<input 
										type="email" 
										class="form-control" 
										name="email" 
										placeholder="Email address" 
										required 
										disabled={contactStatus === 'submitting'}
									/>
								</div>
							</div>

							<div class="column col-md-12">
								<div class="form-group">
									<input 
										type="text" 
										class="form-control" 
										name="subject" 
										placeholder="Subject" 
										required 
										disabled={contactStatus === 'submitting'}
									/>
								</div>
							</div>
					
							<div class="column col-md-12">
								<div class="form-group">
									<textarea 
										name="message" 
										class="form-control" 
										rows="5" 
										placeholder="Message" 
										required
										disabled={contactStatus === 'submitting'}
									></textarea>
								</div>
							</div>

							<input type="text" name="company" style="display: none;" tabindex="-1" autocomplete="off" />
						</div>

						<button type="submit" class="btn btn-default" disabled={contactStatus === 'submitting'}>
							{contactStatus === 'submitting' ? 'Sending...' : 'Send Message'}
						</button>
					</form>
				</div>
			</div>
		</div>
	</section>

	<div class="spacer" data-height="96"></div>
	
	<footer class="footer">
		<div class="container">
			<span class="copyright">
				© {new Date().getFullYear()} {data.profile?.fullName || 'Your Name'}. All Rights reserved.
			</span>
		</div>
	</footer>
</main>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}

	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
	}

	.profile-img {
		border-radius: 50%;
		object-fit: cover;
	}

	.profile-img-placeholder {
		width: 108px;
		height: 108px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: rgba(255, 255, 255, 0.8);
		font-size: 40px;
	}

	.portfolio-filter li {
		cursor: pointer;
		padding: 8px 16px;
		transition: all 0.3s ease;
	}

	.portfolio-filter li.current {
		font-weight: bold;
		border-bottom: 2px solid #FF4C60;
	}

	.project-info {
		padding: 20px;
		display: none;
	}

	.portfolio-item:hover .project-info {
		display: block;
	}

	:global(.btn-default) {
		background-color: #FF4C60 !important;
		border-color: #FF4C60 !important;
		color: white !important;
	}

	:global(.btn-default:hover) {
		background-color: #e43f54 !important;
		border-color: #e43f54 !important;
	}

	#preloader {
		transition: opacity 0.3s ease;
	}

	.placeholder-thumb {
		width: 100%;
		height: 300px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.placeholder-thumb::after {
		content: '\f1c5';
		font-family: 'Font Awesome 5 Free';
		font-weight: 400;
		font-size: 60px;
		color: rgba(255, 255, 255, 0.3);
	}

	:global(.white-popup p) {

	.alert {
		padding: 15px;
		margin-bottom: 20px;
		border-radius: 4px;
	}

	.alert-success {
		background-color: #d4edda;
		border: 1px solid #c3e6cb;
		color: #155724;
	}

	.alert-danger {
		background-color: #f8d7da;
		border: 1px solid #f5c6cb;
		color: #721c24;
	}
		white-space: pre-line;
	}

	.profile-summary {
		white-space: pre-line;
	}

	.timeline-description {
		white-space: pre-line;
	}

	.experience-list {
		list-style: disc;
		padding-left: 20px;
		margin: 10px 0;
	}

	.experience-list li {
		margin-bottom: 5px;
	}
</style>
